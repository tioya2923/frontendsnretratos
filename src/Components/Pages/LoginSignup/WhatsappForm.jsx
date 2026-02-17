import React, { useState } from "react";
import Select from "react-select";
import { allCountries } from "./countryCodes";

const sortedCountries = [...allCountries].sort((a, b) => {
  if (a.code === "+1") return -1;
  if (b.code === "+1") return 1;
  const codeA = parseInt(a.code.replace(/\D/g, ""), 10);
  const codeB = parseInt(b.code.replace(/\D/g, ""), 10);
  return codeA - codeB;
});

export default function WhatsappForm({ onSubmit, loading }) {
  const [selectedCountry, setSelectedCountry] = useState(sortedCountries[0]);
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  function validateWhatsapp() {
    if (!whatsapp.match(/^\d{8,12}$/)) {
      setError("Número inválido. Insira apenas o número, sem o código do país.");
      return false;
    }
    setError("");
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateWhatsapp()) return;
    onSubmit(selectedCountry.code.replace("+", "") + whatsapp);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <label htmlFor="whatsapp">WhatsApp</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Select
          className="whatsapp-select"
          classNamePrefix="react-select"
          value={{ value: selectedCountry.code, label: (
            <span><span className={`fi fi-${selectedCountry.iso}`} style={{ marginRight: 8 }}></span>{selectedCountry.code}</span>
          )}}
          onChange={option => {
            const found = sortedCountries.find(c => c.code === option.value);
            setSelectedCountry(found || sortedCountries[0]);
          }}
          options={sortedCountries.map(country => ({
            value: country.code,
            label: (
              <span><span className={`fi fi-${country.iso}`} style={{ marginRight: 8 }}></span>{country.code}</span>
            ),
          }))}
          isSearchable
          styles={{ option: (provided) => ({ ...provided, display: 'flex', alignItems: 'center' }), singleValue: (provided) => ({ ...provided, display: 'flex', alignItems: 'center' }) }}
        />
        <input
          type="text"
          id="whatsapp"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ""))}
          required
          placeholder="Número sem código do país"
          pattern="\d{8,12}"
          title="Insira apenas o número, sem o código do país"
          className="whatsapp-input"
          style={{ flex: 1 }}
        />
      </div>
      {error && <span className="error">{error}</span>}
      <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Salvando..." : "Salvar WhatsApp"}
      </button>
    </form>
  );
}
