import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section className={styles.page_404}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.col12}>
            <div className={styles.centerWrap}>
              <h1 className={styles.heading404}>404</h1>
              <div className={styles.four_zero_four_bg}>
              </div>
              <div className={styles.content_box_404}>
                <h3 className={styles.h2}>Looks Like You&apos;re Lost</h3>
                <p>The page you are looking for not available</p>
                <Link href="/" className={styles.link_404}>Go to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
