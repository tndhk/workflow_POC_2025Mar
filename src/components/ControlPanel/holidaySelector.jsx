import React from 'react';

/**
 * 休日国選択コンポーネント
 */
const HolidaySelector = ({ selectedCountries, setSelectedCountries, countries }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Holiday Countries (select multiple)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(countries).map(([code, country]) => (
          <div key={code} className="flex items-center">
            <input
              type="checkbox"
              id={`country-${code}`}
              checked={selectedCountries.includes(code)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCountries([...selectedCountries, code]);
                } else {
                  setSelectedCountries(selectedCountries.filter(c => c !== code));
                }
              }}
              className="form-checkbox"
            />
            <label htmlFor={`country-${code}`} className="text-sm">
              {country.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HolidaySelector;