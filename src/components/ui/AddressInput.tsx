'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city'

interface AddressInputProps {
  value: string | null
  onChange: (value: string) => void
  isEditing: boolean
  className?: string
}

interface AddressFields {
  unit: string
  street: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  barangay: string
}

interface Suggestion {
  label: string
  value: string
  data?: ICountry | IState | ICity
}

export default function AddressInput({ value, onChange, isEditing, className }: AddressInputProps) {
  // Parse the address string into fields
  const parseAddress = (addressString: string | null) => {
    if (!addressString) return {
      unit: '',
      street: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: '',
      barangay: ''
    }

    // Split the address string
    // Display order: unit, street, barangay, city, state, zip, country
    const parts = addressString.split(', ')
    
    // Map each part directly to its corresponding field
    return {
      unit: parts[0] || '',          // First part
      street: parts[1] || '',        // Second part
      barangay: parts[2] || '',      // Third part
      city: parts[3] || '',          // Fourth part
      stateProvince: parts[4] || '', // Fifth part
      postalCode: parts[5] || '',    // Sixth part
      country: parts[6] || ''        // Seventh part
    }
  }

  // Initialize fields with parsed value
  const [fields, setFields] = useState<AddressFields>(parseAddress(value))
  
  // Initialize input states with parsed values
  const [countryInput, setCountryInput] = useState(fields.country)
  const [stateInput, setStateInput] = useState(fields.stateProvince)
  const [cityInput, setCityInput] = useState(fields.city)
  const [barangayInput, setBarangayInput] = useState(fields.barangay)
  
  // Initialize country selection if there's an initial country
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(() => {
    if (fields.country) {
      return Country.getAllCountries().find(c => c.name === fields.country) || null
    }
    return null
  })

  // Initialize states list based on selected country
  const [states, setStates] = useState<IState[]>(() => {
    if (selectedCountry) {
      return State.getStatesOfCountry(selectedCountry.isoCode)
    }
    return []
  })

  // Initialize state selection if there's an initial state
  const [selectedState, setSelectedState] = useState<IState | null>(() => {
    if (selectedCountry && fields.stateProvince) {
      const statesList = State.getStatesOfCountry(selectedCountry.isoCode)
      return statesList.find(s => s.name === fields.stateProvince) || null
    }
    return null
  })

  // Initialize cities list if there's an initial state
  const [cities, setCities] = useState<ICity[]>(() => {
    if (selectedCountry && selectedState) {
      return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
    }
    return []
  })

  // Update fields when value prop changes
  useEffect(() => {
    const newFields = parseAddress(value)
    setFields(newFields)
    setCountryInput(newFields.country)
    setStateInput(newFields.stateProvince)
    setCityInput(newFields.city)
    setBarangayInput(newFields.barangay)
    
    // Only set country if it exists
    if (newFields.country) {
      const countryObj = Country.getAllCountries().find(c => c.name === newFields.country)
      if (countryObj) {
        setSelectedCountry(countryObj)
        const statesList = State.getStatesOfCountry(countryObj.isoCode)
        setStates(statesList)

        // Only set state if it exists
        if (newFields.stateProvince) {
          const state = statesList.find(s => s.name === newFields.stateProvince)
          if (state) {
            setSelectedState(state)
            const citiesList = City.getCitiesOfState(countryObj.isoCode, state.isoCode)
            setCities(citiesList)
          } else {
            setSelectedState(null)
            setCities([])
          }
        } else {
          setSelectedState(null)
          setCities([])
        }
      } else {
        setSelectedCountry(null)
        setStates([])
        setSelectedState(null)
        setCities([])
      }
    } else {
      setSelectedCountry(null)
      setStates([])
      setSelectedState(null)
      setCities([])
    }
  }, [value])

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const statesList = State.getStatesOfCountry(selectedCountry.isoCode)
      setStates(statesList)
      // Only reset state and city if the country has changed
      if (selectedCountry.name !== fields.country) {
        setSelectedState(null)
        setCities([])
        setStateInput('')
        setCityInput('')
      }
    } else {
      // Reset state-related fields when country is cleared
      setStates([])
      setSelectedState(null)
      setCities([])
      setStateInput('')
      setCityInput('')
    }
  }, [selectedCountry, fields.country])

  // Update cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const citiesList = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      setCities(citiesList)
      // Only reset city if the state has changed
      if (selectedState.name !== fields.stateProvince) {
        setCityInput('')
      }
    } else {
      // Reset city-related fields when state is cleared
      setCities([])
      setCityInput('')
    }
  }, [selectedCountry, selectedState, fields.stateProvince])

  // Reset barangay when city changes
  useEffect(() => {
    if (fields.city !== fields.city) {
      setFields(prev => ({ ...prev, barangay: '' }))
      handleFieldChange('barangay', '')
    }
  }, [fields.city])

  // Suggestions state
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  const [showStateSuggestions, setShowStateSuggestions] = useState(false)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  
  // Refs for handling click outside
  const countryRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  // Add selected index state for keyboard navigation
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(-1)
  const [selectedStateIndex, setSelectedStateIndex] = useState(-1)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)

  // Add barangay suggestions state
  const [showBarangaySuggestions, setShowBarangaySuggestions] = useState(false)
  const [selectedBarangayIndex, setSelectedBarangayIndex] = useState(-1)
  const barangayRef = useRef<HTMLDivElement>(null)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountrySuggestions(false)
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setShowStateSuggestions(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false)
      }
      if (barangayRef.current && !barangayRef.current.contains(event.target as Node)) {
        setShowBarangaySuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Format fields into address string
  const formatAddress = (fields: AddressFields, forDisplay: boolean = false): string => {
    if (forDisplay) {
      // For display mode: only include non-empty fields
      const parts = [
        fields.unit,
        fields.street,
        fields.barangay,
        fields.city,
        fields.stateProvince,
        fields.postalCode,
        fields.country
      ].filter(part => part.trim() !== '')
      
      return parts.join(', ')
    } else {
      // For edit mode: include all fields to maintain positions
      const parts = [
        fields.unit,
        fields.street,
        fields.barangay,
        fields.city,
        fields.stateProvince,
        fields.postalCode,
        fields.country
      ]
      return parts.join(', ')
    }
  }

  // Update fields and trigger onChange with formatted address
  const handleFieldChange = (field: keyof AddressFields, value: string) => {
    const newFields = { ...fields, [field]: value }
    setFields(newFields)
    onChange(formatAddress(newFields))
  }

  // Get filtered suggestions
  const getFilteredSuggestions = (input: string, items: Array<ICountry | IState | ICity>): Suggestion[] => {
    if (!input.trim()) return []
    const inputLower = input.toLowerCase()
    return items
      .filter(item => item.name.toLowerCase().includes(inputLower))
      .map(item => ({
        label: item.name,
        value: item.name,
        data: item
      }))
      .slice(0, 5)
  }

  // Handle keyboard navigation
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    suggestions: Suggestion[],
    setIndex: (index: number) => void,
    currentIndex: number,
    onSelect: (suggestion: Suggestion) => void
  ) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setIndex(Math.min(currentIndex + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setIndex(Math.max(currentIndex - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (currentIndex >= 0 && suggestions[currentIndex]) {
          onSelect(suggestions[currentIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowCountrySuggestions(false)
        setShowStateSuggestions(false)
        setShowCitySuggestions(false)
        setSelectedCountryIndex(-1)
        setSelectedStateIndex(-1)
        setSelectedCityIndex(-1)
        break
    }
  }

  // Reset indices when suggestions change
  useEffect(() => {
    setSelectedCountryIndex(-1)
  }, [showCountrySuggestions])

  useEffect(() => {
    setSelectedStateIndex(-1)
  }, [showStateSuggestions])

  useEffect(() => {
    setSelectedCityIndex(-1)
  }, [showCitySuggestions])

  // Get barangay suggestions based on city
  const getBarangaySuggestions = (input: string): Suggestion[] => {
    if (!input.trim() || !fields.city) return []
    // This is a mock function - in a real app, you'd fetch barangays from an API or database
    // For now, we'll just show some example barangays based on the input
    const mockBarangays = [
      'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
      'Poblacion', 'San Jose', 'San Miguel', 'Santa Cruz', 'Santo Niño'
    ]
    const inputLower = input.toLowerCase()
    return mockBarangays
      .filter(barangay => barangay.toLowerCase().includes(inputLower))
      .map(barangay => ({
        label: barangay,
        value: barangay
      }))
      .slice(0, 5)
  }

  // Update barangay with capitalized text
  const handleBarangayChange = (value: string) => {
    const capitalizedValue = capitalizeWords(value)
    setBarangayInput(capitalizedValue)
    handleFieldChange('barangay', capitalizedValue)
  }

  // Handle country selection
  const handleCountrySelect = (suggestion: Suggestion | null) => {
    const country = suggestion?.value || ''
    setCountryInput(country)
    setSelectedCountry(suggestion?.data as ICountry || null)
    
    // Reset dependent fields
    setStateInput('')
    setCityInput('')
    setBarangayInput('')
    setSelectedState(null)
    setCities([])
    
    // Update fields after resetting dependents
    const newFields = { 
      ...fields, 
      country,
      stateProvince: '',
      city: '',
      barangay: ''
    }
    setFields(newFields)
    onChange(formatAddress(newFields))
    setShowCountrySuggestions(false)
    setSelectedCountryIndex(-1)
  }

  // Handle state selection
  const handleStateSelect = (suggestion: Suggestion | null) => {
    const state = suggestion?.value || ''
    setStateInput(state)
    setSelectedState(suggestion?.data as IState || null)
    
    // Reset dependent fields
    setCityInput('')
    setBarangayInput('')
    
    // Update fields after resetting dependents
    const newFields = {
      ...fields,
      stateProvince: state,
      city: '',
      barangay: ''
    }
    setFields(newFields)
    onChange(formatAddress(newFields))
    setShowStateSuggestions(false)
    setSelectedStateIndex(-1)
  }

  // Handle city selection or manual entry
  const handleCitySelect = (suggestion: Suggestion | null) => {
    const city = suggestion?.value || ''
    setCityInput(city)
    
    // Reset dependent fields
    setBarangayInput('')
    
    // Update fields after resetting dependents
    const newFields = {
      ...fields,
      city,
      barangay: ''
    }
    setFields(newFields)
    onChange(formatAddress(newFields))
    setShowCitySuggestions(false)
    setSelectedCityIndex(-1)
  }

  // Handle manual city input
  const handleCityChange = (value: string) => {
    setCityInput(value)
    const newFields = {
      ...fields,
      city: value
    }
    setFields(newFields)
    onChange(formatAddress(newFields))
    if (value) {
      setShowCitySuggestions(true)
    }
  }

  if (!isEditing) {
    // In view mode, only show non-empty values
    const displayValue = value ? formatAddress(parseAddress(value), true) : 'Not provided'
    const textColor = displayValue === 'Not provided' ? 'text-gray-500' : 'text-gray-800'
    return <p className={`font-medium break-words ${textColor}`}>{displayValue}</p>
  }

  // Get suggestions for each field
  const countrySuggestions = getFilteredSuggestions(countryInput, Country.getAllCountries())
  const stateSuggestions = getFilteredSuggestions(stateInput, states)
  const citySuggestions = selectedState ? 
    getFilteredSuggestions(cityInput, City.getCitiesOfState(selectedCountry?.isoCode || '', selectedState.isoCode) || []) 
    : []

  const isPhilippines = fields.country === 'Philippines'
  const barangaySuggestions = isPhilippines ? getBarangaySuggestions(fields.barangay) : []

  return (
    <div className="flex flex-wrap gap-2 w-full">
      <div ref={countryRef} className="relative">
        <input
          type="text"
          value={countryInput}
          onChange={(e) => {
            const value = e.target.value
            setCountryInput(value)
            if (!value) {
              handleCountrySelect(null)
            } else {
              setShowCountrySuggestions(true)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !countryInput) {
              handleCountrySelect(null)
            } else {
              handleKeyDown(
                e,
                countrySuggestions,
                setSelectedCountryIndex,
                selectedCountryIndex,
                handleCountrySelect
              )
            }
          }}
          placeholder="Country"
          className="w-[150px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400"
        />
        {showCountrySuggestions && countrySuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {countrySuggestions.map((suggestion, index) => (
              <div
                key={suggestion.value}
                className={`px-2 py-1 cursor-pointer ${index === selectedCountryIndex ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-900`}
                onClick={() => handleCountrySelect(suggestion)}
              >
                {suggestion.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={stateRef} className="relative">
        <input
          type="text"
          value={stateInput}
          onChange={(e) => {
            const value = e.target.value
            setStateInput(value)
            if (!value) {
              handleStateSelect(null)
            } else {
              setShowStateSuggestions(true)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !stateInput) {
              handleStateSelect(null)
            } else {
              handleKeyDown(
                e,
                stateSuggestions,
                setSelectedStateIndex,
                selectedStateIndex,
                handleStateSelect
              )
            }
          }}
          placeholder="State/Province"
          disabled={!selectedCountry}
          className="w-[150px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400 disabled:opacity-50"
        />
        {showStateSuggestions && stateSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {stateSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.value}
                className={`px-2 py-1 cursor-pointer ${index === selectedStateIndex ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-900`}
                onClick={() => handleStateSelect(suggestion)}
              >
                {suggestion.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={cityRef} className="relative">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => {
            const value = e.target.value
            handleCityChange(value)
            if (!value) {
              handleCitySelect(null)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !cityInput) {
              handleCitySelect(null)
            } else if (e.key === 'Enter' && cityInput && !showCitySuggestions) {
              // Allow manual entry on Enter if no suggestions are shown
              e.preventDefault()
              handleCitySelect({ value: cityInput, label: cityInput })
            } else {
              handleKeyDown(
                e,
                citySuggestions,
                setSelectedCityIndex,
                selectedCityIndex,
                handleCitySelect
              )
            }
          }}
          onBlur={() => {
            // Save the manually entered city value when input loses focus
            setTimeout(() => {
              if (cityInput && !showCitySuggestions) {
                handleCitySelect({ value: cityInput, label: cityInput })
              }
            }, 200)
          }}
          placeholder="City"
          disabled={!selectedState}
          className="w-[150px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400 disabled:opacity-50"
        />
        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
            {citySuggestions.map((suggestion, index) => (
              <div
                key={suggestion.value}
                className={`px-2 py-1 cursor-pointer ${index === selectedCityIndex ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-900`}
                onClick={() => handleCitySelect(suggestion)}
              >
                {suggestion.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barangay input - show only for Philippines */}
      {isPhilippines && (
        <div className="relative">
          <input
            type="text"
            value={barangayInput}
            onChange={(e) => handleBarangayChange(e.target.value)}
            placeholder="Barangay"
            disabled={!cityInput}
            className="w-[150px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400 disabled:opacity-50"
          />
        </div>
      )}

      <input
        type="text"
        value={fields.street}
        onChange={(e) => handleFieldChange('street', e.target.value)}
        placeholder="Street Address"
        className="w-[200px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400"
      />

      <input
        type="text"
        value={fields.unit}
        onChange={(e) => handleFieldChange('unit', e.target.value)}
        placeholder="Unit/Apt/House #"
        className="w-[120px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400"
      />

      <input
        type="text"
        value={fields.postalCode}
        onChange={(e) => handleFieldChange('postalCode', e.target.value)}
        placeholder="zip code"
        className="w-[90px] bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006633] focus:border-[#006633] rounded font-medium placeholder-gray-400"
      />
    </div>
  )
} 