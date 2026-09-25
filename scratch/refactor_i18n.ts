import {
  Project,
  SyntaxKind,
  ConditionalExpression,
  Node,
  VariableDeclaration,
} from "ts-morph";
import * as fs from "fs";
import * as path from "path";

// Initialize Project
const project = new Project({
  tsConfigFilePath: "../tsconfig.json",
});

const arLocalePath = "../src/locales/ar.json";
const enLocalePath = "../src/locales/en.json";

const arLocale = JSON.parse(fs.readFileSync(arLocalePath, "utf-8"));
const enLocale = JSON.parse(fs.readFileSync(enLocalePath, "utf-8"));

if (!arLocale.auto) arLocale.auto = {};
if (!enLocale.auto) enLocale.auto = {};

let keyCounter = 1;

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 4)
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

function processFile(file: any) {
  let fileChanged = false;

  const conditionals = file.getDescendantsOfKind(
    SyntaxKind.ConditionalExpression,
  );

  conditionals.forEach((cond: ConditionalExpression) => {
    const condition = cond.getCondition();
    const whenTrue = cond.getWhenTrue();
    const whenFalse = cond.getWhenFalse();

    if (Node.isBinaryExpression(condition)) {
      const left = condition.getLeft();
      const right = condition.getRight();
      const op = condition.getOperatorToken().getKind();

      let isLangCheck = false;
      let arFirst = true; // true if lang === "ar"

      if (
        left.getText() === "lang" &&
        op === SyntaxKind.EqualsEqualsEqualsToken &&
        (right.getText() === '"ar"' || right.getText() === "'ar'")
      ) {
        isLangCheck = true;
      } else if (
        left.getText() === "lang" &&
        op === SyntaxKind.EqualsEqualsEqualsToken &&
        (right.getText() === '"en"' || right.getText() === "'en'")
      ) {
        isLangCheck = true;
        arFirst = false;
      }

      if (isLangCheck) {
        if (
          (Node.isStringLiteral(whenTrue) ||
            Node.isNoSubstitutionTemplateLiteral(whenTrue)) &&
          (Node.isStringLiteral(whenFalse) ||
            Node.isNoSubstitutionTemplateLiteral(whenFalse))
        ) {
          const strTrue = whenTrue.getLiteralText();
          const strFalse = whenFalse.getLiteralText();

          const arText = arFirst ? strTrue : strFalse;
          const enText = arFirst ? strFalse : strTrue;

          let key = toCamelCase(enText);
          if (!key) key = "str" + keyCounter++;

          // ensure unique key
          let finalKey = key;
          let dupIdx = 1;
          while (
            enLocale.auto[finalKey] &&
            enLocale.auto[finalKey] !== enText
          ) {
            finalKey = key + dupIdx;
            dupIdx++;
          }

          arLocale.auto[finalKey] = arText;
          enLocale.auto[finalKey] = enText;

          cond.replaceWithText(`t("auto.${finalKey}")`);
          fileChanged = true;
        }
      }
    }
  });

  // Now, if fileChanged, ensure `t` is available.
  if (fileChanged) {
    const useAppCalls = file
      .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
      .filter((node: VariableDeclaration) => {
        const init = node.getInitializer();
        return (
          init &&
          Node.isCallExpression(init) &&
          init.getExpression().getText() === "useApp"
        );
      });

    if (useAppCalls.length > 0) {
      useAppCalls.forEach((decl: VariableDeclaration) => {
        const nameNode = decl.getNameNode();
        if (Node.isObjectBindingPattern(nameNode)) {
          const elements = nameNode.getElements();
          const hasT = elements.some((el) => el.getName() === "t");
          if (!hasT) {
            const text = nameNode.getText();
            nameNode.replaceWithText(text.replace("}", ", t}"));
          }
        }
      });
    } else {
      // If no useApp, we probably need useTranslation. Let's just log it for manual review.
      console.log(`Needs manual review for 't': ${file.getFilePath()}`);
    }
  }

  return fileChanged;
}

let modifiedCount = 0;
const files = project.getSourceFiles();

files.forEach((file) => {
  if (file.getFilePath().includes("__tests__")) return; // skip tests
  if (processFile(file)) {
    modifiedCount++;
    console.log(`Modified: ${file.getFilePath()}`);
  }
});

project.saveSync();

fs.writeFileSync(arLocalePath, JSON.stringify(arLocale, null, 2), "utf-8");
fs.writeFileSync(enLocalePath, JSON.stringify(enLocale, null, 2), "utf-8");

console.log(`Done! Modified ${modifiedCount} files.`);
