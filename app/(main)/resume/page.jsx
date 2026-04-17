// // import { getResume } from "@/actions/resume";
// // import ResumeBuilder from "./_components/resume-builder";

// // export default async function ResumePage() {
// //   const resume = await getResume();

// //   return (
// //     <div className="container mx-auto py-6">
// //       <ResumeBuilder initialContent={resume?.content} />
// //     </div>
// //   );
// // }


// import { getResume } from "@/actions/resume";

// export default async function ResumePage() {
//   const resume = await getResume();

//   return (
//     <div className="max-w-4xl mx-auto py-12 px-6">
//       <h1 className="text-3xl font-bold mb-6">
//         My Resume
//       </h1>

//       <pre className="bg-slate-900 text-white p-6 rounded-lg whitespace-pre-wrap">
//         {resume?.content || "No resume found. Start writing your resume."}
//       </pre>
//     </div>
//   );
// }

import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
