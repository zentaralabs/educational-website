import { redirect } from "next/navigation";

/** /universities/in has no page of its own; the state pages live at
 * /universities/in/[state]. Send bare visits to the full directory. */
export default function UniversitiesInIndex() {
  redirect("/universities");
}
