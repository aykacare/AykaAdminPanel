import { useEffect, useState } from "react";

function CountdownTimer({ toTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const targetTime = new Date(`1970-01-01T${toTime}:00`).getTime(); // assume HH:mm:ss

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`).getTime();
      const diff = targetTime - currentTime;

      if (diff <= 0) {
        setTimeLeft("Time Expired");
        clearInterval(interval);
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
        const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");
        setTimeLeft(`${hrs}:${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [toTime]);

  return <Text color="blue.500" fontWeight="bold">Countdown: {timeLeft}</Text>;
}

export default CountdownTimer;