import AutoText from "./AutoText";
import "./ChiefComplaint.css";

const complaints = [
  { id: "fever", label: "Fever" },
  { id: "cough", label: "Cough / Cold" },
  { id: "pain", label: "Body Pain" },
  { id: "other", label: "Something else" },
];

function ChiefComplaint({ lang, onSelect }) {
  return (
    <div className="complaint-container">
      <h1 className="complaint-heading">
        <AutoText text="What is your main problem?" langCode={lang} />
      </h1>
      {complaints.map((c) => (
        <button key={c.id} className="complaint-button" onClick={() => onSelect(c.id)}>
          <AutoText text={c.label} langCode={lang} />
        </button>
      ))}
    </div>
  );
}

export default ChiefComplaint;