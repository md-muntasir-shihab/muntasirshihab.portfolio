import { useState } from "react"
import { createPortal } from "react-dom"
import { useStore } from "../lib/store"
import { type Lang } from "../lib/data"
import { Printer, X, Globe, Mail, Phone, MapPin, ExternalLink, ArrowLeft } from "lucide-react"

interface AtsCvModalProps {
  onClose?: () => void
  initialLang?: Lang
  standalone?: boolean
}

export default function AtsCvModal({ onClose, initialLang = "en", standalone = false }: AtsCvModalProps) {
  const { profile, education, experience, skills, tools, achievements, projects } = useStore()
  const [lang, setLang] = useState<Lang>(initialLang)

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en)

  const handlePrint = () => {
    window.print()
  }

  // Extract important social links
  const linkedin = profile.socials?.find((s: any) => s.name === "LinkedIn" && s.enabled)?.url
  const github = profile.socials?.find((s: any) => s.name === "GitHub" && s.enabled)?.url
  const behance = profile.socials?.find((s: any) => s.name === "Behance" && s.enabled)?.url

  // Helper to format URLs for text-only display in print
  const cleanUrl = (url: string) => {
    if (!url) return ""
    return url.replace(/https?:\/\/(www\.)?/, "")
  }

  const modalContent = (
    <div 
      className={`ats-cv-root ${standalone ? "min-h-screen bg-[#11121c]" : "fixed inset-0 bg-black/85 backdrop-blur-sm overflow-y-auto flex justify-center p-0 sm:p-5 md:p-8"}`}
      style={standalone ? undefined : { zIndex: 9999 }}
    >
      {/* Dynamic inline styles for print layout optimization */}
      <style>{`
        @media print {
          /* Hide all non-printable elements */
          body * {
            visibility: hidden;
            background: none !important;
          }
          .ats-cv-root, .ats-cv-root * {
            visibility: visible;
          }
          .ats-cv-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .ats-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
          a {
            text-decoration: none !important;
            color: black !important;
          }
          @page {
            size: letter;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className={`relative w-full max-w-4xl flex flex-col ${standalone ? "mx-auto p-4 sm:p-6" : ""}`}>
        
        {/* Control Toolbar */}
        <div className="no-print flex items-center justify-between mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-[#c9ccd6]">
          <div className="flex items-center gap-2">
            {standalone ? (
              <a href="/cv" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-[13px] transition text-yellow-500 font-medium">
                <ArrowLeft size={15} />
                {t("Back to Portal", "পোর্টাল ব্যাক")}
              </a>
            ) : (
              <div className="text-[14px] font-bold text-white">{t("ATS CV Auto-Generator", "ATS সিভি অটো-জেনারেটর")}</div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Lang Toggle */}
            <button
              onClick={() => setLang(l => (l === "en" ? "bn" : "en"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[13px] border border-white/[0.08] transition"
            >
              <Globe size={14} />
              <span>{lang === "en" ? "বাংলা" : "English"}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-[600] text-[13px] transition"
            >
              <Printer size={14} />
              <span>{t("Print / Save PDF", "প্রিন্ট / PDF সেভ")}</span>
            </button>

            {/* Close Button */}
            {!standalone && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
                title={t("Close", "বন্ধ করুন")}
                aria-label={t("Close", "বন্ধ করুন")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic ATS Resume Sheet */}
        <div className="ats-sheet w-full bg-white text-black p-8 md:p-12 shadow-2xl rounded-2xl border border-gray-200 overflow-hidden font-sans text-[10.5pt] leading-relaxed">
          {/* Header */}
          <header className="text-center border-b-[2px] border-black pb-4 mb-6">
            <h1 className="text-[24pt] font-bold tracking-tight text-black uppercase leading-tight font-serif">
              {profile.name[lang]}
            </h1>
            <div className="text-[12pt] font-semibold text-gray-700 tracking-wide mt-1 uppercase font-serif">
              {profile.title[lang]}
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-[9.5pt] text-gray-600 font-sans">
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail size={12} className="no-print" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
                </span>
              )}
              {(profile.email && profile.phone) && <span className="text-gray-400">|</span>}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} className="no-print" />
                  <a href={`tel:${profile.phone}`} className="hover:underline">{profile.phone}</a>
                </span>
              )}
              {(profile.phone && profile.location) && <span className="text-gray-400">|</span>}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="no-print" />
                  <span>{profile.location[lang]}</span>
                </span>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[9.5pt] font-medium text-gray-700">
              {linkedin && (
                <span className="flex items-center gap-0.5">
                  <span className="no-print font-bold mr-1">LinkedIn:</span>
                  <a href={linkedin} target="_blank" rel="noreferrer" className="hover:underline text-blue-800">
                    {cleanUrl(linkedin)}
                  </a>
                </span>
              )}
              {(linkedin && github) && <span className="text-gray-400">|</span>}
              {github && (
                <span className="flex items-center gap-0.5">
                  <span className="no-print font-bold mr-1">GitHub:</span>
                  <a href={github} target="_blank" rel="noreferrer" className="hover:underline text-gray-900">
                    {cleanUrl(github)}
                  </a>
                </span>
              )}
              {((github || linkedin) && behance) && <span className="text-gray-400">|</span>}
              {behance && (
                <span className="flex items-center gap-0.5">
                  <span className="no-print font-bold mr-1">Behance:</span>
                  <a href={behance} target="_blank" rel="noreferrer" className="hover:underline text-blue-600">
                    {cleanUrl(behance)}
                  </a>
                </span>
              )}
            </div>
          </header>

          {/* Body */}
          <div className="space-y-6">
            
            {/* Professional Summary */}
            {profile.bioLong?.[lang] && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-2 font-serif text-black">
                  {t("Professional Summary", "পেশাদারী সারসংক্ষেপ")}
                </h2>
                <p className="text-justify text-gray-800 leading-relaxed">
                  {profile.bioLong[lang]}
                </p>
              </section>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-3 font-serif text-black">
                  {t("Professional Experience", "পেশাগত অভিজ্ঞতা")}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp: any, index: number) => (
                    <div key={index} className="item">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span className="text-[11pt]">{exp.role[lang]}</span>
                        <span className="text-[10pt] font-normal font-sans text-gray-600">{exp.period}</span>
                      </div>
                      <div className="flex justify-between text-[10pt] font-medium text-gray-700 italic">
                        <span>{exp.company}</span>
                        <span className="font-normal not-italic text-gray-600">{exp.location}</span>
                      </div>
                      {exp.bullets?.[lang] && exp.bullets[lang].length > 0 && (
                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-gray-800">
                          {exp.bullets[lang].map((bullet: string, idx: number) => (
                            <li key={idx} className="pl-0.5">{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-3 font-serif text-black">
                  {t("Education", "শিক্ষা")}
                </h2>
                <div className="space-y-3">
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="item">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span className="text-[11pt]">{edu.school}</span>
                        <span className="text-[10pt] font-normal font-sans text-gray-600">{edu.period}</span>
                      </div>
                      <div className="text-[10pt] text-gray-700 font-medium">
                        {edu.degree[lang]} {edu.note?.[lang] && <span className="font-normal text-gray-500">({edu.note[lang]})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-3 font-serif text-black">
                  {t("Key Projects", "প্রধান প্রজেক্টসমূহ")}
                </h2>
                <div className="space-y-4">
                  {projects.map((proj: any, index: number) => (
                    <div key={index} className="item">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span className="text-[11pt]">
                          {proj.title[lang]}
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="no-print inline-flex items-center ml-2 text-blue-700 text-[9pt] font-normal hover:underline">
                              <ExternalLink size={10} className="mr-0.5" /> Demo
                            </a>
                          )}
                          {proj.github && (
                            <a href={proj.github} target="_blank" rel="noreferrer" className="no-print inline-flex items-center ml-2 text-gray-700 text-[9pt] font-normal hover:underline">
                              <ExternalLink size={10} className="mr-0.5" /> Repo
                            </a>
                          )}
                        </span>
                        <span className="text-[10pt] font-normal font-sans text-gray-600">{proj.year}</span>
                      </div>
                      {proj.blurb?.[lang] && (
                        <p className="text-[10pt] text-gray-800 mt-0.5">{proj.blurb[lang]}</p>
                      )}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="text-[9pt] font-medium text-gray-600 mt-1">
                          <span className="font-semibold text-gray-700">{t("Technologies:", "প্রযুক্তি:")}</span> {proj.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills & Tools */}
            {((skills && skills.length > 0) || (tools && tools.length > 0)) && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-2 font-serif text-black">
                  {t("Technical Skills & Tools", "প্রযুক্তিগত দক্ষতা ও টুলস")}
                </h2>
                <div className="text-[10pt] space-y-1.5 text-gray-800">
                  {skills && skills.length > 0 && (
                    <div>
                      <span className="font-bold text-gray-900">{t("Core Skills:", "মূল দক্ষতা:")}</span>{" "}
                      {skills.map((s: any) => `${s.name} (${s.level}%)`).join(", ")}
                    </div>
                  )}
                  {tools && tools.length > 0 && (
                    <div>
                      <span className="font-bold text-gray-900">{t("Tools & Technologies:", "টুলস ও প্রযুক্তি:")}</span>{" "}
                      {tools.join(", ")}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <section>
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-2 font-serif text-black">
                  {t("Key Honors & Volunteer Leadership", "সম্মাননা ও স্বেচ্ছাসেবী নেতৃত্ব")}
                </h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {achievements.map((ach: any, index: number) => (
                    <li key={index} className="pl-0.5">{ach[lang] || ach.en || ach}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Personal Details */}
            {profile.personalDetails && (
              <section className="no-print">
                <h2 className="text-[12pt] font-bold border-b border-black uppercase tracking-wider pb-0.5 mb-2 font-serif text-black">
                  {t("Personal Details", "ব্যক্তিগত তথ্য")}
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10pt] text-gray-800">
                  {profile.personalDetails.gender && (
                    <div>
                      <span className="font-semibold">{t("Gender:", "লিঙ্গ:")}</span> {profile.personalDetails.gender[lang]}
                    </div>
                  )}
                  {profile.personalDetails.nationality && (
                    <div>
                      <span className="font-semibold">{t("Nationality:", "জাতীয়তা:")}</span> {profile.personalDetails.nationality[lang]}
                    </div>
                  )}
                  {profile.personalDetails.bloodGroup && (
                    <div>
                      <span className="font-semibold">{t("Blood Group:", "রক্তের গ্রুপ:")}</span> {profile.personalDetails.bloodGroup}
                    </div>
                  )}
                  {profile.personalDetails.dob && (
                    <div>
                      <span className="font-semibold">{t("Date of Birth:", "জন্ম তারিখ:")}</span> {profile.personalDetails.dob[lang]}
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  )

  if (standalone) {
    return modalContent
  }

  return createPortal(modalContent, document.body)
}
