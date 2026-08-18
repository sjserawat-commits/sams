import styles from "./registration-background.module.css";

export default function NewPatientLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.registrationRoute}>{children}</div>;
}
