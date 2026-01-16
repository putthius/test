"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";
import {
  competition,
  participant,
  SelectParticipant,
} from "@/app/type";

export default function SelectParticipants({
  participants,
  subList,
}: {
  participants: {
    [key in competition]: { [key: string]: SelectParticipant[] };
  };
  subList: { [T in competition]: string[] };
}) {
  const [selectedOption, setSelectedOption] = useState<competition>("KVIS-ISF"); // KVIS-ISF
  const [subOptions, setSubOptions] = useState<string[]>(selectedOption ? subList[selectedOption] : []);
  const [checkIn, setCheckIn] = useState<{ [T: string]: boolean }>({});
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>(""); // Country or School
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false)  

  const getParticipants = () => {
    return participants[selectedOption][selectedFilter]
      ? participants[selectedOption][selectedFilter]
      : [];
  };

  const handleSubOptionChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const filterValue = event.target.value;
    setSelectedFilter(filterValue);

    fetch(
      `/api/participants?conference=${selectedOption}&filterValue=${encodeURIComponent(
        filterValue
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        const ret: participant[] = data.participants;
        const newCheck: { [T: string]: boolean } = {};
        ret.forEach((val) => {
          newCheck[`${val.name} ${val.familyName}`] = val.checkedIn;
        });
        setCheckIn(newCheck || {});
      })
      .catch(() => setCheckIn({}));
  };

  const handleConfirm = () => {
    setSubmitted(true)
    fetch("/api/updateSheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedParticipants: [selectedParticipant],
        competitionType: selectedOption,
        
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const encodedFilter = encodeURIComponent(selectedFilter);
          const encodedComp = selectedOption;

          // 👉 Go to information page for correction
          router.push(
            `/information?selected=${selectedParticipant}&conference=${encodedComp}&filterValue=${encodedFilter}`
          );
        } 
      })
      .catch(()=>{
        setSubmitted(false)
      });
  };

  return (
    <div className="container">

      {subOptions.length > 0 && (
        <div>
          <h3>Select your School</h3>
          <select className="dropdown" onChange={handleSubOptionChange}>
            <option value="">-- Select --</option>
            {subOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
  
      {getParticipants().length > 0 && (
        <>
        <h3>Select your Name</h3>
        <div className="participants">
          <ul>
            {participants[selectedOption][selectedFilter].map(
              (participant, index) => {
                const fullName = `${participant.name} ${participant.familyName}`;
                return (
                  <li
                    key={index}
                    className={`participant ${
                      checkIn[fullName] ? "checked-in" : "not-checked-in"
                    }`}
                    onClick={() =>
                      setSelectedParticipant(fullName)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipant == fullName}
                      onClick={(e) => e.stopPropagation()} // ⛔ prevent double toggle
                      onChange={() =>
                        setSelectedParticipant(fullName)
                      }
                    />
                    <span className="participant-name">
                      {participant.name} {participant.familyName} (
                      {participant.role})
                    </span>
                  </li>
                );
              }
            )}
          </ul>
        </div>
        </>
      )}

      {(selectedParticipant) && (
        <button className="confirm-button" onClick={handleConfirm} disabled={submitted}>
          {submitted ? "Loading..." : "Next ➤"}
        </button>
      )}
    </div>
  );
}
