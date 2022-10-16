import { useEffect, useState } from "react";
import Modal from "../components/modal";
import { AnimatePresence } from "framer-motion";
import Loading from "../components/Loading";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useTimer from "../hooks/useTimer";
import { useContext } from "react";
import myContext from "../store/myContext";
import styles from "../styles/MainQuiz.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useInsertionEffect } from "react";

export default function PhaserGame() {
  const [prompt, setPrompt] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();
  const [endTime, setEndTime] = useState();
  const router = useRouter();

  const { hours, minutes, seconds } = useTimer(endTime);

  const myCtx = useContext(myContext);
  const TEAM_ID = myCtx.teamId;

  useEffect(() => {
    if (session) {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/team/roundtwo/start/${TEAM_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessTokenBackend}`,
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then(async (response) => {
          return response.json();
        })
        .then((data) => {
          if (data.error?.errorCode) {
            // if error like time limit exceeded
            window.location = "/instructions"
            if (data.error?.errorCode === 35) {
              console.log("asdf");
            }
            toast.error(`${data.message}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            return;
          }

          console.log(data);
          setEndTime(data.endTime);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [session]);

  useEffect(() => {
    setIsLoading(true);
    async function initPhaser() {
      const Phaser = await import("phaser");
      const { default: GridEngine } = await import("grid-engine");
      const { default: Preloader } = await import(
        "../scenes/techPark/Preloader-techPark"
      );
      const { default: TestScene } = await import(
        "../scenes/techPark/TestScene-techPark"
      );

      const phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        title: "round-one-techPark",
        parent: "game-content",
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        pixelArt: true,
        scale: {
          zoom: 2,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [Preloader, TestScene],
        physics: {
          default: "arcade",
          arcade: {
            debug: true,
          },
        },
        plugins: {
          scene: [
            {
              key: "gridEngine",
              plugin: GridEngine,
              mapping: "gridEngine",
            },
          ],
        },
        backgroundColor: "#9592a2",
      });

      setIsLoading(false);
    }
    initPhaser();
  }, []);

  useEffect(() => {
    const dialogBoxEventListener = ({ detail }) => {
      setPrompt(detail.areaName);
    };
    window.addEventListener("prompt", dialogBoxEventListener);
  }, []);

  const closePrompt = (reply) => {
    if (reply) {
      console.log(reply.slice(-1));
      if (session) {
        fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/api/team/roundtwo/${TEAM_ID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessTokenBackend}`,
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
              boxChoice: 1,
            }),
          }
        )
          .then(async (response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            // after submitting box no.
            window.location = '/instructions';
          });
        }
    }
    setPrompt(false);

    // const customEvent = new CustomEvent('promptClosed', {
    // });
    // window.dispatchEvent(customEvent);
  };

  return (
    <>
      <ToastContainer />
      {/* <Game/> */}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {endTime && (
            <div className={styles.starting}>
              <div className={styles.btn}>
                <a href="#" className={`${styles.button_2} ${styles.w_button}`}>
                  {hours}:{minutes}:{seconds}
                </a>
              </div>
            </div>
          )}
          <div id="game-content" key="game-content"></div>
          <AnimatePresence
            initial={false}
            exitBeforeEnter={true}
            onExitComplete={() => null}
          >
            {prompt && (
              <Modal
                modalOpen={prompt}
                handleClose={() => {
                  closePrompt(false);
                }}
                text={`Do you want to place your resort in ${prompt}?`}
                text1={"This action can't be reversed!!"}
                text2={"Yes I'm sure"}
                text2func={() => {
                  closePrompt(prompt);
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
