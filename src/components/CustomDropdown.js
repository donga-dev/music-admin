import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./CustomDropdown.css";

const CustomDropdown = ({
  options = [],
  value = "",
  onChange = () => {},
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue, optionLabel) => {
    setSelectedValue(optionValue);
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      className={`custom-dropdown ${className} ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      <div
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="dropdown-text">{displayText}</span>
        <FiChevronDown className={`dropdown-arrow ${isOpen ? "open" : ""}`} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div
              key={option.value || index}
              className={`dropdown-option ${selectedValue === option.value ? "selected" : ""}`}
              onClick={() => handleSelect(option.value, option.label)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
