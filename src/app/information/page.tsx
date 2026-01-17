"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./information.module.css";
import { categories, competition } from "../type";
export const dynamic = 'force-dynamic'
interface Participant {
  name: string;
  familyName: string;
  role: string;
  checkedIn: boolean;
  dietary?: string;
  medical?: string;
  tshirt?: string;
  projectTitle?: string;
  projectCategory?: string;
}

function InformationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);

  const [selectedParticipants, setSelectedParticipants] = useState<string>("");
  const [competitionType, setCompetitionType] = useState<competition>("");

  const [name, setName] = useState(false);
  const [project, setProject] = useState(false);
  const [cate, setCate] = useState(false);

  const [nameMod, setNameMod] = useState("Loading");
  const [projectMod, setProjectMod] = useState("Loading");
  const [cateMod, setCateMod] = useState("Loading");
  const role = useRef("");
  const oldName = useRef("");

  useEffect(() => {
    const parsedSelected = searchParams.get("selected") ?? "";
    const comp: competition =
      (searchParams.get("conference") as competition) || "ICYS";
    const filter = searchParams.get("filterValue") || "";

    setSelectedParticipants(parsedSelected);
    setCompetitionType(comp);

    fetch(
      `/api/participants?conference=${comp}&filterValue=${encodeURIComponent(
        filter
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        const checkingIn = data.participants.filter((p: Participant) =>
          parsedSelected.includes(`${p.name} ${p.familyName}`)
        );
        const part: Participant = checkingIn[0];
        role.current = part.role;
        setNameMod(`${part.name} ${part.familyName}`);
        setProjectMod(part.projectTitle || "None");
        setCateMod(part.projectCategory || "None");
        oldName.current = `${part.name} ${part.familyName}`;
      })
      .catch(() => {
        
      });
  }, [searchParams]);

  const submitCorrections = () => {
    setSubmitted(true);
    fetch("/api/updateSheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        corrections : {
          [oldName.current]: {
            name: nameMod,
            projectTitle: projectMod,
            projectCategory: cateMod,
          }
        },
        selectedParticipants : [selectedParticipants],
        competitionType,
        highlightGreen: true,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push(
            `/confirmed?name=${nameMod}&project=${projectMod}&category=${cateMod}&role=${role.current}&conference=${competitionType}`
          );
        } else {
          setSubmitted(false)
          alert("Error submitting corrections: " + data.error);
        }
      });
  };

  return (
    <>
      <div className={styles.container}>
        <h2 style={{ textAlign: "center" }}>
          Please Check and Confirm All Your Information Carefully
        </h2>
        <h2 style={{fontSize:"1em", fontWeight:"normal"}}>Your information will be used in your certificate.</h2>

        <li className={styles.participantItem}>
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Name: </div>
              <div
                className={styles.detailLabel}
                style={{ fontSize: "0.5em", fontWeight: "normal" }}
              >
                If you wish to include your special or academic title (e.g.
                Prof., Dr.), you may indicate the full writing in the box below
              </div>
              <input
                type="text"
                placeholder="Title or Correction if needed"
                className={`${styles.detailValue}`}
                value={nameMod}
                disabled={name}
                onChange={(ev) => setNameMod(ev.currentTarget.value)}
                style={{height:34}}
              />
              <div
                className={`${styles.buttonEdit} ${name ? "active" : ""}`}
                onClick={() => setName((a) => !a)}
              >
                {name ? "Success!" : "Confirm Name"}
              </div>
              <span style={{ color: "#53d85a", fontWeight: "bolder" }}>
                {name ? " ✓" : ""}
              </span>
            </div>
            {role.current==="Student" ? (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Project Title:</span>
                  <textarea
                    className={styles.detailValue}
                    rows={4}
                    value={projectMod}
                    disabled={project}
                    onChange={(ev) => setProjectMod(ev.currentTarget.value)}
                  />
                  <div
                    className={`${styles.buttonEdit} ${project ? "active" : ""}`}
                    onClick={() => setProject((a) => !a)}
                  >
                    {project ? "Success!" : "Confirm Project"}
                  </div>
                  <span style={{ color: "#53d85a", fontWeight: "bolder" }}>
                    {project ? " ✓" : ""}
                  </span>
                </div>
                <div className={styles.detailCat}>
                  <span className={styles.detailLabel}>Project Category:</span>
                  <select
                    className={styles.detailValue}
                    disabled={cate}
                    value={cateMod}
                    onChange={(ev) => setCateMod(ev.currentTarget.value)}
                    style={{height:34}}
                  >
                    {categories.map((v) => (
                      <option value={v} key={v} className="detail-value">
                        {v}
                      </option>
                    ))}
                  </select>
                  <div
                    className={`${styles.buttonEdit} ${cate ? "active" : ""}`}
                    onClick={() => setCate((a) => !a)}
                  >
                    {cate ? "Success!" : "Confirm Category"}
                  </div>
                  <span style={{ color: "#53d85a", fontWeight: "bolder" }}>
                    {cate ? " ✓" : ""}
                  </span>
                </div>
              </>
            ): null}
          </div>
        </li>
        <div className={styles.buttonRow}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/")}
          >
            ⬅️ Back to Selection
          </button>
          <button
            className={`${styles.submitButton} ${styles.submitButtonActive}`}
            onClick={submitCorrections}
            disabled={submitted || !(name && project && cate)}
          >

            {submitted ? "Submitted ✅" : "Confirm and Check-in"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function InformationPage() {
  return (
    <Suspense fallback={"aa"}>
      <InformationContent />
    </Suspense>
  );
}
