import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";

function CountdownTimer({ fromTime, toTime }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!fromTime || !toTime) {
      setDisplay("Invalid Time");
      return;
    }

    const parseTime = (timeStr) => {
      const [h, m, s = "00"] = timeStr.split(":").map(Number);
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
    };

    const fromDateTime = parseTime(fromTime);
    const toDateTime = parseTime(toTime);

    const updateDisplay = () => {
      const now = new Date();

      if (now < fromDateTime) {
        setDisplay(""); // or set to "Not Started"
        return;
      }

      if (now >= toDateTime) {
        setDisplay("Time Expired");
        return;
      }

      const diff = toDateTime - now;

      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
      const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");
      setDisplay(`${hrs}:${mins}:${secs}`);
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);

    return () => clearInterval(interval);
  }, [fromTime, toTime]);

  if (!display) return null;

  return (
    <Text fontSize="sm" fontWeight="600" color={display === "Time Expired" ? "red.500" : "blue.500"}>
      {display === "Time Expired" ? display : `Countdown: ${display}`}
    </Text>
  );
}

export default CountdownTimer;
