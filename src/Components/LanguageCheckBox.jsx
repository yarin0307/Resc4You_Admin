import React from 'react'

export default function LanguageCheckBox({ languageList, selectedLanguages, handleLanguageChange }) {
    return (
        <div>
            {languageList.map((language) => (
                <label key={language.languageId} style={{ margin: '10px' }}>
                    <input style={{ margin: "10px" }}
                        type="checkbox"
                        checked={selectedLanguages.includes(language.languageId)}
                        onChange={() => handleLanguageChange(language.languageId)}
                    />
                    {language.languageName}
                </label>
            ))}
        </div>
    )
}
