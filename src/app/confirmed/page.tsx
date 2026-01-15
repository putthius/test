import Link from "next/link";
import styles from "./confirmed.module.css";

export const dynamic = 'force-dynamic'

export default async function ConfirmedContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) 
{
  const {name,project,category} = await searchParams
  return (
    <>
      <div className={styles.container}>
        <h2 style={{color : "#0f750f"}}>Confirmed Information ✓</h2>
        <span className={styles.participantName}>
          {name}
        </span>
        <div className={styles.detail}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Project Title:</span>
            <span className={styles.detailValue}>
              {project || "None"}
            </span>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Project Category:</span>
              <span className={styles.detailValue}>
                {category || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Aligned button container */}
        <div className={styles.buttonRow}>
          <Link className={styles.backButton} href={"/"}> 
            ← Return to Registration
          </Link>
        </div>
      </div>
    </>
  );
}