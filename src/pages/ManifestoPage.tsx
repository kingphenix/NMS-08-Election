import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/nms-new-logo.webp'
import alphaCandidateImg from '../assets/images/Alpha Company.jpeg'
import bravoCandidateImg from '../assets/images/Bravo Company Candidate.jpeg'
import charlieCandidateImg from '../assets/images/Charlie Company Candidate.jpeg'
import deltaCandidateImg from '../assets/images/Delta Company Candidate.jpeg'
import echoCandidateImg from '../assets/images/Echo Company Candidate.jpeg'
import foxtrotCandidateImg from '../assets/images/Foxtrot Company Candidate.jpeg'
import golfCandidateImg from '../assets/images/Golf Company Candidate.jpeg'

import { supabase } from '../lib/supabase'
import { Vote, Award, CheckCircle2, Search, BookOpen, X, Maximize2, Camera } from 'lucide-react'

interface CandidateInfo {
  id: string
  name: string
  company: string
  color: string
  photoUrl?: string
  tagline: string
  bio: string
  pledges: string[]
  fullManifesto?: string[]
  fullPledges?: string[]
  isWithdrawn?: boolean
}

const LOREM_TAGLINE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
const LOREM_BIO = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const LOREM_PLEDGES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco.'
]
const LOREM_FULL_MANIFESTO = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.',
  'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at multo elit. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.',
  'Morbi lectus risus, porta vel, pharetra dui, sed, pellentesque at, eros. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
]

/* ── Alpha Company Candidate Official Manifesto Data (Sende Kaun Jeffrey Myles) ── */
const ALPHA_TAGLINE = 'Brotherhood. Network. One Purpose.'

const ALPHA_BIO =
  '“We entered as boys. We stand today as men. What binds us is not distance, titles or success—it is the brotherhood we earned.” I am not asking for your vote to occupy a seat. I am asking for your trust to strengthen what already belongs to all of us.'

const ALPHA_CARD_PLEDGES = [
  'Protect the Brotherhood: Every Exboy matters. Every voice deserves to be heard.',
  'Build the Network: Turn our connections into opportunities for careers, business, mentorship and support.',
  'Lead with Purpose: Transparent leadership, active communication and decisions that serve the entire set.',
  'Create Lasting Value: An NMS ’08 that becomes more useful to every member with each passing year.'
]

const ALPHA_FULL_MANIFESTO = [
  'Brotherhood. Network. One Purpose. Sende Kaun Jeffrey Myles (08/6478) — Alpha Company Candidate for Chairman, NMS ’08.',
  '“We entered as boys. We stand today as men. What binds us is not distance, titles or success—it is the brotherhood we earned.” I am not asking for your vote to occupy a seat. I am asking for your trust to strengthen what already belongs to all of us.',
  'My Commitment: (1) Protect the Brotherhood — Every Exboy matters. Every voice deserves to be heard. (2) Build the Network — Turn our connections into opportunities for careers, business, mentorship and support.',
  'My Commitment: (3) Lead with Purpose — Transparent leadership, active communication and decisions that serve the entire set. (4) Create Lasting Value — An NMS ’08 that becomes more useful to every member with each passing year.',
  'The Alpha Principle: At Alpha, we learned that leadership is earned by showing up, carrying others when necessary, and finishing together. That is the spirit I bring to this office. No empty promises. No unnecessary noise. Just deliberate action for the set we proudly call home. — Vote 08/6478 Sende Kaun Jeffrey Myles (Alpha Company Candidate | NMS ’08)'
]

export const ALPHA_FULL_PLEDGES = [
  'Protect the Brotherhood — Ensure every Exboy matters and every voice deserves to be heard.',
  'Build the Network — Turn our connections into opportunities for careers, business, mentorship and support.',
  'Lead with Purpose — Maintain transparent leadership, active communication and decisions that serve the entire set.',
  'Create Lasting Value — Build an NMS ’08 that becomes more useful to every member with each passing year.',
  'Embody The Alpha Principle — Demonstrate leadership earned by showing up, carrying others when necessary, and finishing together.',
  'Deliver Deliberate Action — Lead with no empty promises and no unnecessary noise, taking action for the set we proudly call home.'
]

/* ── Bravo Company Candidate Official Manifesto Data ── */
const BRAVO_TAGLINE = 'Dedicated to Total Transparency, Robust Member Welfare, and Enduring Brotherhood.'

const BRAVO_BIO =
  'Honourable members of the NMS 08 Ex-Boys chapter. Having been nominated by my prestigious company members, it is my humble pleasure to declare to you my aspiration of becoming the Chairman of this prestigious set. My administration will serve with dedicated stewardship, total financial transparency, and genuine welfare for all comrades.'

const BRAVO_CARD_PLEDGES = [
  'Welfare & Relief: Continuous wedding gifts, compassionate financial assistance, and official visitations for celebrations, illness, and bereavement.',
  'Employment & Prosperity: Strategic networking with sister chapters and the national body for jobs, plus collective investment vehicles.',
  'Accountability: Consolidated single association account with multi-signatory control and quarterly financial reports.',
  'Brotherhood & Unity: Accessible get-togethers, friendly games to reminisce old days, zero fraud tolerance, and dispute mediation.'
]

const BRAVO_FULL_MANIFESTO = [
  'Honourable members of NMS 08 Ex-Boys chapter. Having been nominated by my prestigious company members, it is my humble pleasure to declare to you my aspiration of becoming the Chairman of this prestigious set. If elected, I pledge to serve the best interest of the NMS 08 chapter to the very best of my ability, ensuring that no member walks alone.',
  'Member Welfare & Social Solidarity: We will stand firmly with every comrade through both joyful milestones and unexpected hardships. We will continue financial support for newlyweds, coordinate delegations to celebrate with members, and offer rapid compassionate visits and relief to those battling illness or grieving the loss of loved ones.',
  'Career Networking & Collective Investments: Our administration will build active bridges with sister chapters and the national alumni executive body to connect qualified members with career opportunities. Additionally, we will identify secure, profitable investment vehicles to increase our financial standing both individually and as a group.',
  'Airtight Financial Transparency: Trust is the cornerstone of great leadership. We will guarantee complete fiscal accountability by consolidating all association funds into a single official account requiring multiple verified signatories, complemented by comprehensive quarterly financial balance sheets delivered directly to general members.',
  'Camaraderie, Integrity & Fraternal Harmony: We will organize affordable get-togethers in neutral settings to socialize without financial strain, alongside friendly games to enjoy ourselves and reminisce about our school days. We will enforce strict zero-tolerance policies on fraud between members and proactively resolve disputes so we truly live as our brothers’ keepers with zero bad blood.'
]

export const BRAVO_FULL_PLEDGES = [
  'Serve the best interest of the NMS 08 chapter to the best of my ability.',
  'Continue to provide financial aid to newly wedded members among us.',
  'Network with other chapters and the national body to secure jobs for qualified members.',
  'Organise official visits to those of us celebrating personal occasions.',
  'Organise compassionate visits and relief for members experiencing illness or loss of a loved one.',
  'Give responsive aid and emergency relief in whatever way possible to members in need.',
  'Ensure total financial transparency by presenting quarterly reports to general members.',
  'Collect all monetary funds in a single association account with multiple signatories for accountability.',
  'Find viable investment vehicles to increase our financial standings both as individuals and as a group.',
  'Organise accessible get-togethers where we can meet and socialise without serious financial strain.',
  'Organise friendly games where we can enjoy ourselves and reminisce the old days.',
  'Uphold strict zero-tolerance measures when it comes to fraudulent issues between members.',
  'Proactively resolve disputes between members to ensure we live as our brothers’ keepers without bad blood.'
]

/* ── Charlie Company Candidate Official Manifesto Data ── */
const CHARLIE_TAGLINE = 'Turning Brotherhood into Influence, Opportunities into Impact, and Impact into Legacy.'

const CHARLIE_BIO =
  'Fourteen years ago, we entered NMS as boys; in 2014, we walked out as men. Today, we are professionals, entrepreneurs, and leaders of influence. My mission is to transform NMS 08 into a highly connected, prosperous, and impactful brotherhood where membership is not merely a title, but an undeniable advantage built on trust, mutual opportunity, and accountability.'

const CHARLIE_CARD_PLEDGES = [
  'Connect — Know Your Brother: Establish an active NMS 08 Members Network linking skills, businesses, locations, and opportunities.',
  'Create — Build Opportunities: Move beyond congratulations to foster B2B collaborations, professional referrals, and pooled investments.',
  'Care — Brotherhood Beyond Words: Practical, responsive welfare mechanisms ensuring we celebrate, mourn, stand, and rise together.',
  'Accountability & Trust: Consultative governance, open communication, transparent stewardship, and responsible resource management.'
]

const CHARLIE_FULL_MANIFESTO = [
  'Fourteen years ago, we entered the gates of the Nigerian Military School as boys. In 2014, we walked out as men. We came from different backgrounds, families, and parts of the country with different dreams and abilities. But the School gave us something indelible: a bond. It taught us discipline when we wanted comfort, resilience in hardship, responsibility over excuses, and the foundational truth that a man is stronger when he stands shoulder-to-shoulder with his brothers.',
  'Today, we are doctors, engineers, lawyers, entrepreneurs, soldiers, academics, administrators, professionals, fathers, husbands, and leaders. We have become men of influence—and the time has come for NMS 08 to harness that influence into an association where membership is an active advantage built on trust, collaboration, and brotherhood.',
  'Our 4-Point Agenda: (1) CONNECT — Establishing a functional Members Network so our collective strength becomes our greatest asset. (2) CREATE — Combining our hundreds of years of professional experience into business collaborations, career referrals, mentorship, and investment initiatives so NMS 08 becomes a vibrant marketplace of ideas and opportunities.',
  'Our 4-Point Agenda: (3) CARE — Strengthening our welfare system so brotherhood is proven when a brother needs us most; celebrating together, mourning together, standing together, and rising together. (4) ACCOUNTABILITY — Clear communication, consultative decision-making, responsible financial stewardship, and regular reporting because leadership is earned through action.',
  'The NMS 08 Standard: Discipline in our dealings, Unity in our brotherhood, Excellence in our endeavors, Integrity in our leadership, and Service in our purpose. Chairmanship is not a throne—it is a sacred responsibility. Let us turn our brotherhood into influence, our influence into opportunities, our opportunities into impact, and our impact into legacy. The time is now!'
]

export const CHARLIE_FULL_PLEDGES = [
  'Establish a functional NMS 08 Members Network keeping us connected professionally and personally.',
  'Create active pathways for business-to-business collaborations and entrepreneurship partnerships.',
  'Facilitate professional job referrals, career opportunities, and executive networking across industries.',
  'Establish collective investment vehicles to build individual and set-wide financial standing.',
  'Institutionalize mentorship, skill sharing, and professional knowledge transfer between comrades.',
  'Strengthen the welfare system to provide practical, reliable support during critical moments of need.',
  'Celebrate personal and career milestones together as an unbreakable brotherhood.',
  'Provide compassionate visits, presence, and relief during illness, bereavement, or hardship.',
  'Maintain clear and continuous communication so every member is informed of association affairs.',
  'Ensure responsible financial management with uncompromising integrity and transparent accounting.',
  'Institutionalize consultative leadership where key decisions involve the general membership.',
  'Provide regular stewardship and financial reporting to the general assembly.',
  'Uphold the NMS 08 Standard: Discipline, Unity, Excellence, Integrity, and Service.'
]

/* ── Echo Company Candidate Official Manifesto Data (Ukonna Ikenna Kingsley) ── */
const ECHO_TAGLINE = 'Unity, Progress, and Lasting Impact — Service Over Self, Action Over Promises.'

const ECHO_BIO =
  'Dear Esteemed Members of the NMS 08 Set, leadership is not about holding a title—it is about listening, serving, and ensuring every member feels valued and represented. Together, we can build a stronger, more united, and more impactful community that we will all be proud to belong to.'

const ECHO_CARD_PLEDGES = [
  'Unity & Inclusiveness: Foster brotherhood across all regions and backgrounds, guaranteeing every member a voice in decisions.',
  'Transparency & Accountability: Open communication, scheduled activity updates, and total fiscal accountability to general members.',
  'Structured Welfare System: Dependable welfare safety nets providing mutual assistance, compassion, and solidarity during major life events.',
  'Effective Communication & Growth: Timely briefings, two-way feedback, and sustainable leadership structures benefiting NMS 08 and Ex-Boys at large.'
]

const ECHO_FULL_MANIFESTO = [
  'Theme: "Unity, Progress, and Lasting Impact." Dear Esteemed Members of the NMS 08 Set, it is with great humility and a strong sense of responsibility that I present myself to serve as your Set Chairman. Leadership, to me, is not about holding a title—it is about listening, serving, and ensuring that every member feels valued and represented.',
  'Vision & Mission: My vision is to build an Association that is united, inclusive, transparent, and committed to the welfare and success of every member. My mission is to lead with integrity, accountability, and dedication while creating opportunities for growth, collaboration, and lasting friendships among all comrades.',
  '5-Point Agenda (Unity, Transparency & Welfare): (1) Unity & Inclusiveness — Promoting unity among all members regardless of location or background, encouraging active participation, and ensuring everyone has a voice. (2) Transparency & Accountability — Maintaining open communication, regular updates on set finances and activities, and accountability in all leadership decisions. (3) Welfare & Member Support — Establishing a structured welfare system to support members during significant life events and fostering community solidarity.',
  '5-Point Agenda (Communication & Growth): (4) Effective Communication — Improving communication through regular meetings, timely updates, and proactive member feedback. (5) Growth & Legacy — Organizing meaningful social, professional, and networking activities, facilitating mentorship, and building a sustainable leadership structure that will benefit both the NMS 08 Set and Ex-Boys at large.',
  'My Leadership Promise: If entrusted with your mandate, I promise to lead with honesty and fairness, listen before making decisions, treat every member with respect, work tirelessly for the progress of our set, and remain accessible and accountable throughout my tenure. Because I believe in service over self, action over promises, unity over division, progress over stagnation, and accountability over excuses. Together, we can build a stronger, united, and more prosperous NMS 08 Set. — UKONNA IKENNA KINGSLEY'
]

export const ECHO_FULL_PLEDGES = [
  'Promote unity among all members regardless of location, background, or chapter.',
  'Encourage active, enthusiastic participation in all NMS 08 set activities.',
  'Ensure every member has an active voice and representation in decision-making.',
  'Maintain open, continuous communication between the executive and members.',
  'Provide regular updates on the activities and financial stewardship of the set.',
  'Enforce total accountability and transparency in all leadership decisions.',
  'Establish a structured welfare system to support members during significant life events.',
  'Promote mutual assistance, compassionate care, and solidarity among comrades.',
  'Improve communication through regular meetings, timely briefings, and member feedback.',
  'Organize meaningful social, professional, and industry networking activities.',
  'Encourage mentorship, skills enhancement, and career development opportunities.',
  'Build a sustainable leadership structure that benefits both NMS 08 and Ex-Boys at large.',
  'Uphold the Leadership Promise: Service over self, action over promises, and progress over stagnation.'
]

/* ── Delta Company Candidate Official Manifesto Data ── */
const DELTA_TAGLINE = 'One Set. One Vision. Lasting Legacy — Together We Served. Together We Lead. Together We Build.'

const DELTA_BIO =
  'Fellow Distinguished Members of NMS 08 Set, our strength has never been in our individual companies, but in the enduring brotherhood we continue to share. Today, I present myself not as the candidate of one company, but as a servant of the entire Set—committed to strengthening our institutions, ensuring total transparency, and building opportunities that benefit every member.'

const DELTA_CARD_PLEDGES = [
  'Institutional Governance: Review and strengthen our governance framework within 100 days, standardize transitions, and collaborate with EXBA.',
  'Transparency & Accountability: Deliver quarterly financial reports, annual stewardship accounts, and comprehensive documentation.',
  'Welfare & Brotherhood: Robust emergency funds, hospital visitation, bereavement family support, and celebrating personal milestones.',
  'Business & Legacy: Establish a Set Business Directory, quarterly networking, mentorship, career platforms, and lasting legacy projects.'
]

const DELTA_FULL_MANIFESTO = [
  'One Set. One Vision. Lasting Legacy. Fellow Distinguished Members of NMS 08 Set, twelve years after passing out from the Nigerian Military School, our strength has never been in the companies we belonged to, but in the brotherhood we continue to share. Today, I present myself not as the candidate of one company, but as a humble servant of the entire NMS 08 Set.',
  'Strengthening Our Institution & Transparency: Our predecessors laid an important foundation; my commitment is to build on that foundation. Within my first 100 days, I will work with the Governing Council to review our governance framework, standardize leadership transition procedures, ensure administrative continuity, and actively collaborate with EXBA. Our set deserves institutions, not personalities.',
  'Accountability & Stewardship: Every member deserves to know how our resources are managed. My administration will provide detailed quarterly financial reports, annual stewardship accounts, open communication on all projects and decisions, and proper institutional documentation for future administrations. Trust grows through transparency.',
  'Welfare & Professional Network: No member should feel forgotten. We will strengthen emergency welfare support, hospital visitations, bereavement support, and personal milestone celebrations. Furthermore, our Set is blessed with officers, professionals, entrepreneurs, doctors, lawyers, bankers, engineers, and public servants. I will establish a Set Business Directory, quarterly professional networking sessions, mentorship programs, and career referral platforms.',
  'Legacy & My Promise: Working with the Set, we will identify and execute projects that leave a lasting legacy—including educational initiatives, community development, strengthening our annual reunion, and digital preservation of our history. I cannot promise perfection, but every decision will be guided by one question: "Will this make the NMS 08 Set stronger today and for generations to come?" Together We Served. Together We Lead. Together We Build.'
]

export const DELTA_FULL_PLEDGES = [
  'Review and strengthen our set governance framework within the first 100 days.',
  'Standardize leadership transition procedures to guarantee continuity between administrations.',
  'Foster active, structured collaboration and alignment with the EXBA national body.',
  'Provide comprehensive quarterly financial reports directly to the general membership.',
  'Deliver annual stewardship reports detailing all executive decisions and association projects.',
  'Strengthen emergency welfare funds to rapidly assist members in times of urgent need.',
  'Organize hospital visitations and compassionate solidarity for sick comrades.',
  'Provide dedicated family support and presence during moments of bereavement.',
  'Celebrate members’ personal, family, and career milestones together.',
  'Establish a comprehensive NMS 08 Set Business & Professional Directory.',
  'Host quarterly professional networking, career advancement, and mentorship sessions.',
  'Create a reliable business referral platform connecting member enterprises.',
  'Execute lasting legacy projects: educational support, digital history preservation, and sustainable ventures.'
]

/* ── Foxtrot Company Candidate Official Manifesto Data (Isah Muhammad) ── */
const FOXTROT_TAGLINE = 'Delivering on Brotherhood — Listen, Organise, Communicate, Deliver, and Leave No Brother Behind.'

const FOXTROT_BIO =
  'Fellow Ex-Boys, I am Isah Muhammad (NMS 08/6672/B-WO), proud son of Foxtrot Company (Calabar Coy). I am not contesting for a title, but to contribute with humility, willingness to listen, and readiness to take responsibility. My vision is to build an association members can genuinely depend on—where every brother is heard, supported, and connected, ensuring that when any brother needs help, he knows his set stands firmly behind him.'

const FOXTROT_CARD_PLEDGES = [
  'The 5 Principles: Listen to members, organise our collective talents, communicate consistently, enforce total accountability, and deliver realistic results.',
  'Welfare — Nobody Left Behind: Transparent, organized, and prompt assistance for celebrations, hospital care, and family bereavement.',
  'Brotherhood into Opportunity: Connect entrepreneurs, professionals, employers, and investors for career guidance, patronage, and business referrals.',
  'Sustainable Investments: Professionally and transparently explore collective ventures in agriculture, real estate, and transportation.'
]

const FOXTROT_FULL_MANIFESTO = [
  'Fellow Ex-Boys, I present myself to you with humility, pride, and deep responsibility. I am Isah Muhammad (Ex-boy NMS 08/6672/B-WO), a proud son of Foxtrot Company — Calabar Coy. I sincerely appreciate Foxtrot Company for their trust and confidence in presenting me as their candidate for Chairman. That trust is not just a nomination; it is a sacred responsibility that I will never take for granted.',
  'Why I Am Contesting & The 5 Principles: I am not contesting because I want a title; I am contesting because I believe I can contribute. My administration will be anchored on five core principles: (1) LISTEN — Listening to members because this association belongs to all of us; (2) ORGANISE — Marshalling our doctors, lawyers, engineers, entrepreneurs, and civil servants into an organized collective force; (3) COMMUNICATE — Ensuring clear, consistent updates so no brother feels disconnected; (4) ACCOUNTABILITY — Every contribution and resource respected, tracked, and accounted for; and (5) DELIVERY — Pursuing and fulfilling realistic commitments rather than making empty promises.',
  'Welfare — Nobody Gets Left Behind: Our welfare must remain one of the strongest pillars of NMS 08. When a brother celebrates, we celebrate with him. When a brother is struggling, sick, or loses a loved one, we stand firmly beside him. We will establish clear procedures, proper records, and responsible management to ensure assistance reaches members fairly, transparently, and swiftly.',
  'Turning Brotherhood into Opportunity & Sustainability: We have doctors, lawyers, entrepreneurs, employers, and investors. When we deliberately connect these strengths, opportunities emerge—job guidance, business partnerships, professional mentorship, and commercial patronage. Furthermore, our association should not rely solely on levies; we will professionally and transparently explore sustainable group investments in agriculture, real estate, and transportation to generate lasting institutional value.',
  'Indivisible Unity & Final Appeal: An election must never destroy decades of friendship or make one company feel superior. When this election is over, there will be no Alpha NMS 08, no Bravo NMS 08, no Foxtrot NMS 08—there will simply be NMS 08. I will serve Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, and Golf as one family. I ask for the privilege to serve: not above you, but with you. — ISAH MUHAMMAD'
]

export const FOXTROT_FULL_PLEDGES = [
  'Listen actively to all members and ensure every comrade’s voice shapes association policy.',
  'Organise the collective expertise of our doctors, lawyers, engineers, and entrepreneurs.',
  'Maintain clear, consistent communication so no brother ever feels disconnected.',
  'Uphold total financial accountability with transparent documentation for every resource.',
  'Prioritize realistic deliverable commitments over empty campaign promises.',
  'Strengthen our welfare system ensuring fair, rapid, and transparent assistance to members.',
  'Stand in solid support during bereavement, illness, and personal emergencies.',
  'Celebrate brothers’ joyful milestones, promotions, and achievements collectively.',
  'Create an active internal marketplace for business partnerships and professional referrals.',
  'Facilitate career guidance, job placements, and executive mentorship between comrades.',
  'Carefully and transparently explore sustainable group investments in real estate and agriculture.',
  'Ensure complete set-wide unity, serving Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, and Golf as one.',
  'Lead with humble brotherhood: serving not above the members, but together with all Ex-Boys.'
]

/* ── Golf Company Candidate Official Manifesto Data (Isaac Danmusa) ── */
const GOLF_TAGLINE = 'Uniting Our Strengths, Honoring Our Bond, and Building an Impactful Legacy Together.'

const GOLF_BIO =
  'Dear Distinguished Members of NMS 08 Set, our journey began within the walls of NMS where we learned discipline, integrity, courage, and selfless service. Though life has taken us down different paths, our unbreakable bond inspires me to serve. My vision is simple: to build a stronger, more united, and more impactful NMS 08 Set that every single comrade is proud to belong to.'

const GOLF_CARD_PLEDGES = [
  'Strengthening Unity: Ensure every member feels valued, respected, and included, regardless of location, profession, or background.',
  'Transparent Leadership: Open decision-making, rigorous accountability in set affairs, and constant communication to maintain trust.',
  'Structured Member Welfare: Dependable welfare initiatives to assist members during life emergencies, milestone celebrations, and bereavement.',
  'Networking & Legacy: Professional mentorship, business collaborations, regular reunions, friendly sports, and preserving set history.'
]

const GOLF_FULL_MANIFESTO = [
  'Dear Distinguished Members of the NMS 08 Set, warm greetings to you all. It is with a deep sense of responsibility, humility, and commitment that I present myself for the position of Chairman of our great NMS 08 Set. Our journey began within the walls of the Nigerian Military School, where we were taught discipline, integrity, courage, teamwork, and selfless service. Though life has taken each of us on different paths, the bond we share remains unique and unbreakable. It is this bond that inspires me to serve.',
  'Vision & Priorities (Unity & Transparency): My vision is simple: to build a stronger, more united, and more impactful NMS 08 Set that every member is proud to belong to. (1) Strengthening Unity: Working to ensure every member feels valued, respected, and included regardless of location, profession, or level of participation. (2) Transparent & Accountable Leadership: Leadership is built on trust; I am committed to openness in decision-making, accountability in managing our affairs, and regular communication with members.',
  'Priorities (Welfare & Career Networking): (3) Welfare of Members: Our association should be a source of support during both joyful and challenging moments through structured, fair, and sustainable welfare initiatives for emergencies, celebrations, and bereavement. (4) Career & Business Networking: Encouraging networking opportunities, mentorship, business collaborations, and career development initiatives benefiting every member across military and civilian sectors.',
  'Priorities (Engagement & Legacy): (5) Stronger Engagement: Promoting regular virtual and physical engagements, reunions, sports activities, and social events that preserve the brotherhood we built at NMS. (6) Preserving Our Legacy: Documenting our history, memories, and collective accomplishments for future generations.',
  'Leadership Promise & Call for Unity: If elected, I promise to lead with humility rather than pride, listen before making decisions, serve every member without bias or favoritism, encourage teamwork, and always place the collective interest of the NMS 08 Set above personal interest. This election is not about individuals competing against one another—it is about choosing leadership that will strengthen our brotherhood and position our set for greater achievements. Long Live NMS! Long Live the NMS 08 Set! — ISAAC DANMUSA'
]

export const GOLF_FULL_PLEDGES = [
  'Ensure every member feels valued, respected, and included regardless of location or profession.',
  'Guarantee that every comrade’s voice is heard in guiding association decisions.',
  'Practice open, transparent decision-making with regular updates to the general assembly.',
  'Maintain strict financial accountability and integrity in managing association resources.',
  'Provide structured, reliable welfare support during emergencies, celebrations, and life events.',
  'Facilitate professional networking, business partnerships, and career advancement across sectors.',
  'Establish structured mentorship programs connecting experienced comrades with rising professionals.',
  'Organize regular virtual engagements and town halls to bridge members across different regions.',
  'Host annual physical reunions, social events, and friendly sports activities to strengthen camaraderie.',
  'Support initiatives that preserve the history, achievements, and legacy of the NMS 08 Set.',
  'Lead with humility, listening attentively before making any major executive decision.',
  'Serve every member impartially without bias, favoritism, or sectional sentiment.',
  'Always prioritize the collective progress of the NMS 08 Set above personal interest.'
]

interface CompanyCandidate {
  name: string
  company: string
  color: string
  photoUrl?: string
}

const COMPANY_CANDIDATES: CompanyCandidate[] = [
  { name: 'Sende Kaun Jeffrey Myles', company: 'Alpha Company Candidate', color: '#2563eb', photoUrl: alphaCandidateImg },   /* Blue */
  { name: 'Bravo Company Candidate', company: 'Bravo Company Candidate', color: '#ca8a04', photoUrl: bravoCandidateImg },   /* Yellow */
  { name: 'Charlie Company Candidate', company: 'Charlie Company Candidate', color: '#dc2626', photoUrl: charlieCandidateImg }, /* Red */
  { name: 'Delta Company Candidate', company: 'Delta Company Candidate', color: '#16a34a', photoUrl: deltaCandidateImg },   /* Green */
  { name: 'Echo Company Candidate', company: 'Echo Company Candidate', color: '#9333ea', photoUrl: echoCandidateImg },       /* Purple */
  { name: 'Foxtrot Company Candidate', company: 'Foxtrot Company Candidate', color: '#78350f', photoUrl: foxtrotCandidateImg }, /* Brown */
  { name: 'Golf Company Candidate', company: 'Golf Company Candidate', color: '#db2777', photoUrl: golfCandidateImg },       /* Pink */
]

const getCandidatePhotoUrl = (name: string): string | undefined => {
  if (name.includes('Alpha') || name.includes('Sende') || name.includes('Kaun') || name.includes('Jeffrey') || name.includes('Myles')) return alphaCandidateImg
  if (name.includes('Bravo')) return bravoCandidateImg
  if (name.includes('Charlie')) return charlieCandidateImg
  if (name.includes('Delta')) return deltaCandidateImg
  if (name.includes('Echo')) return echoCandidateImg
  if (name.includes('Foxtrot') || name.includes('Isah') || name.includes('Muhammad') || name.includes('Muhammed')) return foxtrotCandidateImg
  if (name.includes('Golf') || name.includes('Isaac') || name.includes('Danmusa')) return golfCandidateImg
  return undefined
}


const INITIAL_CANDIDATES: CandidateInfo[] = COMPANY_CANDIDATES.map((comp, idx) => {
  const isAlpha = comp.company.includes('Alpha')
  const isBravo = comp.company.includes('Bravo')
  const isCharlie = comp.company.includes('Charlie')
  const isDelta = comp.company.includes('Delta')
  const isEcho = comp.company.includes('Echo')
  const isFoxtrot = comp.company.includes('Foxtrot')
  const isGolf = comp.company.includes('Golf')
  return {
    id: `c-${idx + 1}`,
    name: comp.name,
    company: comp.company,
    color: comp.color,
    photoUrl: comp.photoUrl,
    tagline: isAlpha ? ALPHA_TAGLINE : isBravo ? BRAVO_TAGLINE : isCharlie ? CHARLIE_TAGLINE : isDelta ? DELTA_TAGLINE : isEcho ? ECHO_TAGLINE : isFoxtrot ? FOXTROT_TAGLINE : isGolf ? GOLF_TAGLINE : LOREM_TAGLINE,
    bio: isAlpha ? ALPHA_BIO : isBravo ? BRAVO_BIO : isCharlie ? CHARLIE_BIO : isDelta ? DELTA_BIO : isEcho ? ECHO_BIO : isFoxtrot ? FOXTROT_BIO : isGolf ? GOLF_BIO : LOREM_BIO,
    pledges: isAlpha ? ALPHA_CARD_PLEDGES : isBravo ? BRAVO_CARD_PLEDGES : isCharlie ? CHARLIE_CARD_PLEDGES : isDelta ? DELTA_CARD_PLEDGES : isEcho ? ECHO_CARD_PLEDGES : isFoxtrot ? FOXTROT_CARD_PLEDGES : isGolf ? GOLF_CARD_PLEDGES : LOREM_PLEDGES,
    fullManifesto: isAlpha ? ALPHA_FULL_MANIFESTO : isBravo ? BRAVO_FULL_MANIFESTO : isCharlie ? CHARLIE_FULL_MANIFESTO : isDelta ? DELTA_FULL_MANIFESTO : isEcho ? ECHO_FULL_MANIFESTO : isFoxtrot ? FOXTROT_FULL_MANIFESTO : isGolf ? GOLF_FULL_MANIFESTO : LOREM_FULL_MANIFESTO,
    fullPledges: isAlpha ? ALPHA_FULL_PLEDGES : isBravo ? BRAVO_FULL_PLEDGES : isCharlie ? CHARLIE_FULL_PLEDGES : isDelta ? DELTA_FULL_PLEDGES : isEcho ? ECHO_FULL_PLEDGES : isFoxtrot ? FOXTROT_FULL_PLEDGES : isGolf ? GOLF_FULL_PLEDGES : undefined,
    isWithdrawn: isCharlie
  }
})

export default function ManifestoPage() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateInfo[]>(INITIAL_CANDIDATES)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateInfo | null>(null)
  const [candidatePhotos, setCandidatePhotos] = useState<Record<string, string>>({})

  const handleImageUpload = (candidateId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCandidatePhotos(prev => ({
            ...prev,
            [candidateId]: event.target!.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadCandidates() {
      try {
        const fetchPromise = supabase.from('candidates').select('id, name')
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )

        const res = await (Promise.race([fetchPromise, timeoutPromise]) as Promise<{ data?: Array<{ id: string; name: string }> | null }>)

        if (!mounted) return

        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = COMPANY_CANDIDATES.map((comp, idx) => {
            const dbCandidate = res.data![idx]
            const name = dbCandidate?.name || comp.name
            const isAlpha = comp.company.includes('Alpha') || name.includes('Alpha') || name.includes('Sende') || name.includes('Kaun') || name.includes('Jeffrey') || name.includes('Myles')
            const isBravo = comp.company.includes('Bravo') || name.includes('Bravo')
            const isCharlie = comp.company.includes('Charlie') || name.includes('Charlie') || name.includes('Josiah') || name.includes('Yerima') || idx === 2
            const isDelta = comp.company.includes('Delta') || name.includes('Delta') || name.includes('Filani') || name.includes('Victor')
            const isEcho = comp.company.includes('Echo') || name.includes('Echo') || name.includes('Ukonna') || name.includes('Ikenna')
            const isFoxtrot = comp.company.includes('Foxtrot') || name.includes('Foxtrot') || name.includes('Isah') || name.includes('Muhammad') || name.includes('Muhammed')
            const isGolf = comp.company.includes('Golf') || name.includes('Golf') || name.includes('Isaac') || name.includes('Danmusa')
            return {
              id: dbCandidate?.id || `c-${idx + 1}`,
              name,
              company: comp.company,
              color: comp.color,
              photoUrl: comp.photoUrl || getCandidatePhotoUrl(name) || getCandidatePhotoUrl(comp.company),
              tagline: isAlpha ? ALPHA_TAGLINE : isBravo ? BRAVO_TAGLINE : isCharlie ? CHARLIE_TAGLINE : isDelta ? DELTA_TAGLINE : isEcho ? ECHO_TAGLINE : isFoxtrot ? FOXTROT_TAGLINE : isGolf ? GOLF_TAGLINE : LOREM_TAGLINE,
              bio: isAlpha ? ALPHA_BIO : isBravo ? BRAVO_BIO : isCharlie ? CHARLIE_BIO : isDelta ? DELTA_BIO : isEcho ? ECHO_BIO : isFoxtrot ? FOXTROT_BIO : isGolf ? GOLF_BIO : LOREM_BIO,
              pledges: isAlpha ? ALPHA_CARD_PLEDGES : isBravo ? BRAVO_CARD_PLEDGES : isCharlie ? CHARLIE_CARD_PLEDGES : isDelta ? DELTA_CARD_PLEDGES : isEcho ? ECHO_CARD_PLEDGES : isFoxtrot ? FOXTROT_CARD_PLEDGES : isGolf ? GOLF_CARD_PLEDGES : LOREM_PLEDGES,
              fullManifesto: isAlpha ? ALPHA_FULL_MANIFESTO : isBravo ? BRAVO_FULL_MANIFESTO : isCharlie ? CHARLIE_FULL_MANIFESTO : isDelta ? DELTA_FULL_MANIFESTO : isEcho ? ECHO_FULL_MANIFESTO : isFoxtrot ? FOXTROT_FULL_MANIFESTO : isGolf ? GOLF_FULL_MANIFESTO : LOREM_FULL_MANIFESTO,
              fullPledges: isAlpha ? ALPHA_FULL_PLEDGES : isBravo ? BRAVO_FULL_PLEDGES : isCharlie ? CHARLIE_FULL_PLEDGES : isDelta ? DELTA_FULL_PLEDGES : isEcho ? ECHO_FULL_PLEDGES : isFoxtrot ? FOXTROT_FULL_PLEDGES : isGolf ? GOLF_FULL_PLEDGES : undefined,
              isWithdrawn: isCharlie
            }
          })
          setCandidates(mapped)
        } else {
          setCandidates(INITIAL_CANDIDATES)
        }
      } catch {
        if (!mounted) return
        setCandidates(INITIAL_CANDIDATES)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCandidates()

    return () => {
      mounted = false
    }
  }, [])

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', color: '#0f172a' }}>
      {/* ── Hero Section (Starts Directly with NMS Logo & Official Class Manifesto Portal) ── */}
      <section
        style={{
          background: '#064e3b',
          color: '#ffffff',
          padding: 'var(--sp-12) var(--sp-6)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div className="max-w-xl" style={{ margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* NMS Logo */}
            <img
              src={logo}
              alt="NMS Logo"
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain',
                marginBottom: 'var(--sp-4)'
              }}
            />

            <div
              className="badge"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#6ee7b7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 16px',
                fontSize: '0.8rem',
                marginBottom: 'var(--sp-4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Award size={14} /> Official Class Manifesto Portal
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: 'var(--sp-4)'
              }}
            >
              Shaping the Future of NMS Class of 2008
            </h2>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.85)',
                maxWidth: '640px',
                margin: '0 auto var(--sp-8) auto',
                lineHeight: 1.6
              }}
            >
              Explore candidate manifestos, visions, and promises for the NMS Class of 2008 Set Chairman election.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn"
                style={{
                  background: '#10b981',
                  color: '#064e3b',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none'
                }}
              >
                <Vote size={18} />
                Proceed to Voting Booth
              </button>

              <a
                href="#candidates"
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none'
                }}
              >
                <BookOpen size={18} />
                Explore Manifestos
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Key Metrics Bar ── */}
      <div
        style={{
          background: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          borderBottom: '1px solid #cbd5e1',
          padding: 'var(--sp-6) var(--sp-4)'
        }}
      >
        <div className="max-w-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-6)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>7 Candidates</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Executive Council Aspirants</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>6 Votes</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Allocated Per Verified Voter</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#004526' }}>Max 3</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Candidates Per Ballot</div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>100% Secure</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>Token Verified & Audited</div>
          </div>
        </div>
      </div>

      {/* ── Candidates Section ── */}
      <section id="candidates" style={{ padding: 'var(--sp-12) var(--sp-6)' }}>
        <div className="max-w-xl">
          <div className="text-center" style={{ marginBottom: 'var(--sp-8)' }}>
            <span className="badge badge-purple" style={{ marginBottom: 'var(--sp-2)' }}>MEET THE CANDIDATES</span>
            <h2>Meet the Candidates</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '8px auto 0 auto' }}>
              Search and review each candidate’s manifesto and pledges for the Executive Council.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: 'var(--sp-8)', position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search candidates by company name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '48px', height: '48px', fontSize: '1rem', background: '#ffffff' }}
            />
          </div>

          {/* Candidate Cards Grid */}
          {loading ? (
            <div className="text-center" style={{ padding: 'var(--sp-12)' }}>
              <div className="spinner" style={{ margin: '0 auto', width: 36, height: 36 }} />
              <p className="text-muted" style={{ marginTop: 'var(--sp-4)' }}>Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="card text-center" style={{ padding: 'var(--sp-10)', background: '#ffffff' }}>
              <p className="text-muted">No candidates found matching "{searchQuery}".</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 'var(--sp-4)' }}
                onClick={() => setSearchQuery('')}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-6)' }}>
              {filteredCandidates.map((candidate, index) => {
                const isWithdrawn = Boolean(candidate.isWithdrawn || candidate.company.includes('Charlie') || candidate.name.toLowerCase().includes('charlie'))

                return (
                  <div
                    key={candidate.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: isWithdrawn ? '#f8fafc' : '#ffffff',
                      border: isWithdrawn ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--sp-6)',
                      boxShadow: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Inner Content — dimmed and grayscaled when candidate has withdrawn */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        opacity: isWithdrawn ? 0.45 : 1,
                        filter: isWithdrawn ? 'grayscale(85%)' : 'none',
                        pointerEvents: isWithdrawn ? 'none' : 'auto'
                      }}
                    >
                      <div>
                        {/* Candidate Picture Slot Beside Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                          {/* Circular Picture Slot (Interactive File Upload Slot) */}
                          <label
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              background: '#f8fafc',
                              border: `4px solid ${candidate.color}`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                              cursor: isWithdrawn ? 'not-allowed' : 'pointer',
                              position: 'relative'
                            }}
                            title={isWithdrawn ? 'Candidate Withdrawn' : 'Click to slot candidate image'}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              disabled={isWithdrawn}
                              onChange={(e) => handleImageUpload(candidate.id, e)}
                            />
                            {candidatePhotos[candidate.id] || candidate.photoUrl ? (
                              <img
                                src={candidatePhotos[candidate.id] || candidate.photoUrl}
                                alt={candidate.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: candidate.color }}>
                                <Camera size={26} />
                                <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                  Slot Photo
                                </span>
                              </div>
                            )}
                          </label>

                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                              {candidate.name}
                            </h3>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                color: candidate.color || COMPANY_CANDIDATES[index]?.color || '#2563eb',
                                fontWeight: 700,
                                letterSpacing: '0.01em',
                                display: 'inline-block'
                              }}
                            >
                              {candidate.company || COMPANY_CANDIDATES[index]?.company || `Candidate #${index + 1}`}
                            </span>
                          </div>
                        </div>

                        {/* Manifesto Text */}
                        <p style={{ fontWeight: 600, color: candidate.color, fontSize: '0.95rem', marginBottom: 'var(--sp-3)', lineHeight: 1.4 }}>
                          "{candidate.tagline}"
                        </p>

                        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
                          {candidate.bio}
                        </p>

                        <div style={{ marginBottom: 'var(--sp-6)' }}>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 'var(--sp-2)' }}>
                            Manifesto Highlights:
                          </h4>
                          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {candidate.pledges.map((pledge, pIdx) => (
                              <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: '#1e293b' }}>
                                <CheckCircle2 size={16} style={{ color: candidate.color, flexShrink: 0, marginTop: '2px' }} />
                                <span>{pledge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Expand Manifesto Button using Candidate Color */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 'var(--sp-4)' }}>
                        <button
                          onClick={() => !isWithdrawn && setSelectedCandidate(candidate)}
                          disabled={isWithdrawn}
                          className="btn btn--full"
                          style={{
                            background: isWithdrawn ? '#94a3b8' : candidate.color,
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: isWithdrawn ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isWithdrawn ? (
                            <>🚫 Candidate Withdrawn</>
                          ) : (
                            <>
                              <Maximize2 size={16} />
                              Expand Manifesto
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Very Visible CANDIDATE WITHDRAWN Banner */}
                    {isWithdrawn && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%) rotate(-10deg)',
                          background: '#dc2626',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          letterSpacing: '0.12em',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          border: '3px solid #ffffff',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                          zIndex: 25,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          pointerEvents: 'none'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🚫</span>
                        <span>CANDIDATE WITHDRAWN</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Expand Manifesto Modal Overlay ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-4)',
              overflowY: 'auto'
            }}
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 'var(--sp-8)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                border: '1px solid #cbd5e1'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
                aria-label="Close manifesto modal"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)', paddingRight: '40px' }}>
                <label
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    border: `5px solid ${selectedCandidate.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  title="Click to slot candidate image"
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(selectedCandidate.id, e)}
                  />
                  {candidatePhotos[selectedCandidate.id] || selectedCandidate.photoUrl ? (
                    <img
                      src={candidatePhotos[selectedCandidate.id] || selectedCandidate.photoUrl}
                      alt={selectedCandidate.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: selectedCandidate.color }}>
                      <Camera size={32} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Slot Photo
                      </span>
                    </div>
                  )}
                </label>

                <div>
                  <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {selectedCandidate.name}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      color: selectedCandidate.color || COMPANY_CANDIDATES.find(c => c.name === selectedCandidate.name)?.color || '#2563eb',
                      fontWeight: 700
                    }}
                  >
                    {selectedCandidate.company || COMPANY_CANDIDATES.find(c => c.name === selectedCandidate.name)?.company || 'Candidate'} — Official Manifesto Document
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <div style={{ background: '#f8fafc', padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${selectedCandidate.color}`, marginBottom: 'var(--sp-6)' }}>
                <p style={{ fontWeight: 600, color: selectedCandidate.color, fontSize: '1.05rem', margin: 0 }}>
                  "{selectedCandidate.tagline}"
                </p>
              </div>

              {/* Full Expanded Manifesto Body */}
              <div style={{ marginBottom: 'var(--sp-6)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 'var(--sp-3)' }}>
                  Executive Summary & Vision Statement
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginBottom: 'var(--sp-4)' }}>
                  {selectedCandidate.bio}
                </p>

                {(selectedCandidate.fullManifesto || LOREM_FULL_MANIFESTO).map((paragraph, pIdx) => (
                  <p key={pIdx} style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, marginBottom: 'var(--sp-4)' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Core Pledges */}
              <div style={{ marginBottom: 'var(--sp-8)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 'var(--sp-3)' }}>
                  Key Strategic Action Items & Pledges
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedCandidate.fullPledges || selectedCandidate.pledges).map((pledge, pIdx) => (
                    <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: '#1e293b', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                      <CheckCircle2 size={20} style={{ color: selectedCandidate.color, flexShrink: 0, marginTop: '2px' }} />
                      <span>{pledge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 'var(--sp-6)' }}>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="btn btn-secondary"
                  style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    borderColor: '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '12px 32px',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '200px'
                  }}
                >
                  Close Manifesto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voting Process / Instructions Section ── */}
      <section style={{ padding: 'var(--sp-12) var(--sp-6)', background: '#064e3b', color: '#ffffff' }}>
        <div className="max-w-xl">
          <div className="text-center" style={{ marginBottom: 'var(--sp-10)' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>VOTING INSTRUCTIONS</span>
            <h2 style={{ color: '#ffffff' }}>How to Cast Your Ballot</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '8px auto 0 auto' }}>
              Follow these simple steps to cast your vote using your unique credential token.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-6)' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>01</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Get Token</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Retrieve your 16-character alphanumeric voting token from your official credential letter.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>02</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Access Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Click 'Vote Booth Access', enter your token format (XXXX-XXXX-XXXX-XXXX), and authenticate.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-6)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6ee7b7', marginBottom: 'var(--sp-2)' }}>03</div>
              <h3 style={{ color: '#ffffff', marginBottom: 'var(--sp-2)' }}>Allocate 6 Votes</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                Choose 2 to 3 candidates and distribute your 6 votes between them according to preference (max 3 votes per candidate).
              </p>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: 'var(--sp-10)' }}>
            <button
              onClick={() => navigate('/login')}
              className="btn"
              style={{
                background: '#10b981',
                color: '#064e3b',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '16px 36px',
                borderRadius: 'var(--radius-md)',
                border: 'none'
              }}
            >
              🔐 Access Voting Booth Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: '#043427',
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 'var(--sp-8) var(--sp-6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}
      >
        <div className="max-w-xl flex flex-col items-center gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="NMS Logo" style={{ height: '32px', width: 'auto' }} />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>NMS Class of 2008 Set Chairman Election</span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
            powered by Trinity Vote 2026. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <a href="/login" style={{ color: '#6ee7b7' }}>Voter Login</a>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <a href="/admin" style={{ color: '#6ee7b7' }}>Election Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
