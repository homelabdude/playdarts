import Link from "next/link";
import Head from "next/head";
import styles from "../styles/404.module.css";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | PlayDarts.app</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>404 | Page Not Found</h1>
        <p className={styles.text}>
          Oops! The page you&apos;re l👀king for doesn&apos;t exist.
        </p>
        <Link href="/" className={styles.link}>
          Go Back Home
        </Link>
      </div>
    </>
  );
}
