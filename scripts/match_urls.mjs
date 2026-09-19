import fs from "fs";
const rows = JSON.parse(fs.readFileSync("scripts/data/programs.json"));
const usc = rows.filter(r=>r.university_slug==="university-of-the-sunshine-coast" && r.status==="published");
const pages = fs.readFileSync("/tmp/usc_course_pages.txt","utf8").trim().split("\n");

function norm(s){
  return s.toLowerCase()
    .replace(/[()]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

const pageSlugs = pages.map(p=>{
  const parts = p.split("/");
  return {url:"https://www.unisc.edu.au"+p, cat:parts[3], slug:parts[4]};
});

const HB = "https://www.unisc.edu.au/study/courses-and-programs/previous-student-handbooks/student-handbook-study-period-2-2026/postgraduate-degrees/";

// manual overrides: either a marketing-site slug, or a full URL (for handbook-only pages)
const overrides = {
  "Master of Professional Accounting": "master-of-professional-accounting-mpa",
  "Diploma in Social Sciences": "diploma-in-social-science",
  "Bachelor of Education (Primary)": "bachelor-of-primary-education",
  "Bachelor of Engineering (Electrical and Electronic)(Honours)": "bachelor-of-engineering-honours",
  "Bachelor of Engineering (Honours) - Civil Engineering": "bachelor-of-engineering-honours",
  "Master of Business Administration": "master-of-business-administration-mba",
  "Bachelor of Nursing Science: Graduate Entry": "bachelor-of-nursing-science", // nested pathway, same page
  "Master of Civil Engineering": HB+"master-of-civil-engineering",
  "Master of Mechanical Engineering": HB+"master-of-mechanical-engineering",
  "Master of Renewable Energy Engineering": HB+"master-of-renewable-energy-engineering",
  "Master of Education": HB+"master-of-education",
};

// archive candidates: real cited evidence, not owed
const archiveCandidates = new Set([
  "Master of Philosophy",
  "Master of Robotics and Automation Engineering",
  "Master of Counselling",
  "Master of International Development",
  "Bachelor of International Studies",
  "Bachelor of Social Science (Psychology)",
  "Associate Degree in Science",
  "Undergraduate Certificate in General Studies",
]);

const results = [];
for(const r of usc){
  if(archiveCandidates.has(r.name)){
    results.push({id:r.id, name:r.name, matched:null, archive:true});
    continue;
  }
  let target = norm(r.name);
  let matchedUrl = null;
  if(overrides[r.name]){
    matchedUrl = overrides[r.name].startsWith("http") ? overrides[r.name] : null;
    if(!matchedUrl){
      target = overrides[r.name];
    }
  }
  if(!matchedUrl){
    let match = pageSlugs.find(p=>p.slug===target);
    if(!match){
      const alt = target.endsWith("s") ? target.slice(0,-1) : target+"s";
      match = pageSlugs.find(p=>p.slug===alt);
    }
    matchedUrl = match ? match.url : null;
  }
  results.push({id:r.id, name:r.name, matched:matchedUrl, archive:false});
}
const unmatched = results.filter(r=>!r.matched && !r.archive);
console.log("total:",results.length,"matched:",results.filter(r=>r.matched).length,"archive:",results.filter(r=>r.archive).length,"unmatched:",unmatched.length);
fs.writeFileSync("/tmp/usc_match_results.json", JSON.stringify(results,null,2));
unmatched.forEach(r=>console.log("UNMATCHED:",r.name));
