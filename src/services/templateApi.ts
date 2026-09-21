import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { RequestTemplate } from "../types";

export const templateApi = {
  saveTemplate: async (template: RequestTemplate) => {
    await setDoc(doc(db, "requestTemplates", template.templateId), template);
  },
};
