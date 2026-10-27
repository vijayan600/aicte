import type { Application, Institution, Stage, Criterion, ApplicationStatus } from '../types';

const makeStages = (activeStage: number, categoryCode: string): Stage[] => {
  const hasEVC = !['NRI_SEATS', 'NAME_CHANGE', 'BANK_CHANGE', 'CLOSURE', 'ODL', 'EOA', 'DEPOSIT_RELEASE', 'UNDERTAKING'].includes(categoryCode);

  const stagesDef = [
    {
      id: 's1', number: 1, name: 'Application Submission',
      criteria: [
        { id: 'c1_1', label: 'Basic Details Verified', documentRequired: 'Annexure-1' },
        { id: 'c1_2', label: 'Documents Uploaded', documentRequired: 'All required docs' },
        { id: 'c1_3', label: 'Eligibility Checked', documentRequired: 'Annexure-2' },
        { id: 'c1_4', label: 'Application Accepted', documentRequired: 'System validation' },
      ]
    },
    {
      id: 's2', number: 2, name: 'Scrutiny',
      criteria: [
        { id: 'c2_1', label: 'Document Verification', documentRequired: 'All uploaded docs' },
        { id: 'c2_2', label: 'Academic Compliance', documentRequired: 'University NOC, Affiliation' },
        { id: 'c2_3', label: 'Infrastructure Check', documentRequired: 'Annexure-11, Land docs' },
        { id: 'c2_4', label: 'Clarification (if any)', documentRequired: 'Response doc' },
      ]
    },
    {
      id: 's3', number: 3, name: 'EVC Visit',
      skipped: !hasEVC,
      criteria: [
        { id: 'c3_1', label: 'EVC Scheduled', documentRequired: 'Visit schedule' },
        { id: 'c3_2', label: 'Infrastructure Evaluation', documentRequired: 'EVC checklist' },
        { id: 'c3_3', label: 'Report Submission', documentRequired: 'EVC report' },
        { id: 'c3_4', label: 'Compliance Status', documentRequired: 'Compliance doc' },
      ]
    },
    {
      id: 's4', number: 4, name: 'SAC/SHC Approval',
      criteria: [
        { id: 'c4_1', label: 'Committee Review', documentRequired: 'Review minutes' },
        { id: 'c4_2', label: 'Recommendations', documentRequired: 'Recommendation letter' },
        { id: 'c4_3', label: 'Condition Check', documentRequired: 'Conditions doc' },
        { id: 'c4_4', label: 'Approval Decision', documentRequired: 'Decision record' },
      ]
    },
    {
      id: 's5', number: 5, name: 'Final Approval',
      criteria: [
        { id: 'c5_1', label: 'Final Verification', documentRequired: 'Final checklist' },
        { id: 'c5_2', label: 'Undertaking Submission', documentRequired: 'Affidavit / Undertaking' },
        { id: 'c5_3', label: 'Fee Payment', documentRequired: 'Payment receipt' },
        { id: 'c5_4', label: 'Approval Letter Issued', documentRequired: 'Approval letter' },
      ]
    },
  ];

  return stagesDef.map((s, si) => {
    const stageNum = si + 1;
    const skipped = s.skipped === true;

    let stageStatus: Stage['status'] = 'PENDING';
    if (skipped) stageStatus = 'SKIPPED';
    else if (stageNum < activeStage) stageStatus = 'COMPLETED';
    else if (stageNum === activeStage) stageStatus = 'IN_PROGRESS';

    const criteria: Criterion[] = s.criteria.map((c, ci) => {
      let status: Criterion['status'] = 'PENDING';
      let progress = 0;

      if (skipped) {
        status = 'SKIPPED';
      } else if (stageNum < activeStage) {
        // All completed for past stages
        status = 'COMPLETED';
        progress = 100;
      } else if (stageNum === activeStage) {
        // Partially done
        const completedCount = Math.floor(Math.random() * 3);
        if (ci < completedCount) {
          status = 'COMPLETED';
          progress = 100;
        } else if (ci === completedCount) {
          status = 'IN_PROGRESS';
          progress = Math.floor(Math.random() * 60) + 10;
        }
      }

      return {
        id: c.id,
        label: c.label,
        status,
        progress,
        documentRequired: c.documentRequired,
      };
    });

    return {
      id: s.id,
      number: s.number,
      name: s.name,
      status: stageStatus,
      criteria,
      skipped,
    };
  });
};

const CATEGORIES = [
  { code: 'NEW_INSTITUTE', name: 'New Institute LoA' },
  { code: 'NEW_PROGRAM', name: 'New Program' },
  { code: 'INTAKE_INCREASE', name: 'Increase in Intake' },
  { code: 'EOA', name: 'Annual EoA' },
  { code: 'CHANGE_SITE', name: 'Change of Site' },
  { code: 'NAME_CHANGE', name: 'Name Change' },
  { code: 'BANK_CHANGE', name: 'Bank Account Change' },
  { code: 'CLOSURE', name: 'Closure' },
  { code: 'NRI_SEATS', name: 'NRI Seats' },
  { code: 'APPEAL_SAC', name: 'Appeal to SAC/SHC' },
  { code: 'ODL', name: 'Open Distance Learning' },
  { code: 'UNDERTAKING', name: 'Time-bound Undertaking' },
  { code: 'DEPOSIT_RELEASE', name: 'Security Deposit Release' },
];

const INST_NAMES = [
  'Indian Institute of Technology Advanced', 'National Institute of Technology Excellence',
  'Rajiv Gandhi University of Technology', 'Anna University of Engineering Sciences',
  'Visvesvaraya Technological University', 'Dr. APJ Abdul Kalam Institute',
  'Amity University School of Engineering', 'SRM Institute of Science and Technology',
  'Manipal Academy of Higher Education', 'VIT University Chennai Campus',
  'Kalinga Institute of Industrial Technology', 'Lovely Professional University',
  'Chandigarh University Engineering', 'Thapar Institute of Engineering',
  'Birla Institute of Technology Mesra', 'BITS Pilani Hyderabad Campus',
  'PSG College of Technology', 'Coimbatore Institute of Technology',
  'RV College of Engineering', 'BMS College of Engineering',
  'PES University Bangalore', 'MSRIT Bangalore',
  'Dayananda Sagar University', 'Presidency University Bangalore',
  'Jain University School of Engineering', 'Christ University Engineering',
  'Vellore Institute of Technology AP', 'Koneru Lakshmaiah University',
  'Vignan University Guntur', 'GITAM University Visakhapatnam',
  'Andhra University Engineering', 'JNTU Kakinada',
  'Osmania University College of Technology', 'Chaitanya Bharathi Institute',
  'Vasavi College of Engineering', 'CVR College of Engineering',
  'MITS Gwalior', 'ITM University Gwalior',
  'LNCT Bhopal', 'Oriental Institute of Science and Technology',
  'RGPV University Bhopal', 'SAGE University Bhopal',
  'Prestige Institute of Engineering', 'Technocrats Institute of Technology',
  'Medi-Caps University Indore', 'IPS Academy Indore',
];

const STATES = ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Punjab', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal', 'Kerala', 'Odisha', 'Uttar Pradesh', 'Haryana'];
const REGIONS = ['South', 'South-West', 'South-Central', 'North', 'North-West', 'West', 'East', 'Central'];
const TYPES: Institution['type'][] = ['University', 'Deemed', 'Autonomous', 'Affiliated', 'Private', 'Government'];
const PROGRAMMES = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'B.Arch', 'M.Arch', 'B.Pharm', 'PhD', 'Diploma'];


function randomId(prefix: string, n: number) {
  return `${prefix}${String(n).padStart(4, '0')}`;
}

function daysFromNow(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
}

// Seeded pseudo-random to get stable mock data
let seed = 42;
function seededRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function seededFrom<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

export const MOCK_INSTITUTIONS: Institution[] = INST_NAMES.slice(0, 40).map((name, i) => {
  seed = 1000 + i * 37;
  const state = seededFrom(STATES);
  const region = seededFrom(REGIONS);
  const type = seededFrom(TYPES);
  const numProgs = 2 + Math.floor(seededRandom() * 4);
  const programmes = Array.from({ length: numProgs }, () => seededFrom(PROGRAMMES));
  const uniqueProgs = [...new Set(programmes)];
  const totalDocs = 6 + Math.floor(seededRandom() * 8);
  const submittedDocs = Math.floor(seededRandom() * totalDocs);
  const daysOffset = Math.floor(seededRandom() * 80) - 20;
  const overallStatuses: ApplicationStatus[] = ['PENDING', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETURNED'];
  const overallStatus = seededFrom(overallStatuses);

  return {
    id: randomId('INST', i + 1),
    name,
    aicteId: `AICTE-${2020 + Math.floor(seededRandom() * 6)}-${randomId('', i + 1)}`,
    state,
    region,
    type,
    programmes: uniqueProgs,
    applicationId: randomId('APP', i + 1),
    overallStatus,
    totalDocs,
    submittedDocs,
    deadline: daysFromNow(daysOffset),
    daysOverdue: daysOffset < 0 ? Math.abs(daysOffset) : undefined,
    evcMemberId: i % 5 === 0 ? 'EVC001' : i % 5 === 1 ? 'EVC002' : undefined,
  };
});

export const MOCK_APPLICATIONS: Application[] = MOCK_INSTITUTIONS.map((inst, i) => {
  seed = 2000 + i * 53;
  const activeStage = 1 + Math.floor(seededRandom() * 4);
  const cat = seededFrom(CATEGORIES);

  return {
    id: inst.applicationId,
    institutionId: inst.id,
    category: cat.name,
    categoryCode: cat.code,
    stage: activeStage,
    status: inst.overallStatus,
    stages: makeStages(activeStage, cat.code),
    submittedAt: daysFromNow(-(10 + Math.floor(seededRandom() * 30))),
    deadline: inst.deadline,
    lastUpdated: daysFromNow(-Math.floor(seededRandom() * 5)),
  };
});

export const EVC_MEMBERS = [
  { id: 'EVC001', name: 'Dr. Ramesh Kumar', email: 'ramesh.kumar@aicte.in', assignedCases: MOCK_INSTITUTIONS.filter((_,i) => i % 5 === 0).map(i => i.applicationId) },
  { id: 'EVC002', name: 'Prof. Sunita Sharma', email: 'sunita.sharma@aicte.in', assignedCases: MOCK_INSTITUTIONS.filter((_,i) => i % 5 === 1).map(i => i.applicationId) },
];

export const APPLICATION_CATEGORIES = CATEGORIES;
