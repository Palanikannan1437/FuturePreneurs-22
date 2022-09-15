import Head from "next/head";
import { useSession } from "next-auth/react";
import styles from "../styles/Home.module.css";
import { useEffect } from "react";
import { useRouter } from "next/router.js";
import PendingUserRequests from "../components/PendingUserRequests.jsx";

export default function Home() {

  const {data:session, status} = useSession();
  const router = useRouter();

  // redirects to home if user not logged in 
  useEffect(()=>{
    if (router.isReady){
      if (status === "unauthenticated" && status!=="loading"){
          router.push("/")
      }
    }
  }, [status, router])

  return (
    <div className={styles.container}>

      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}>Futurepreneurs</h1>
      <PendingUserRequests />
    </div>
  );
}
