export const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? `1px solid #4A69F2`
      : `1px solid #4E5779`,
    borderRadius: '0px',
    background: 'transparent',
    color: '#fff'
  }),
  input: () => ({
    color: '#fff',
  }),
  singleValue: () => ({
    color: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? '#fff' : '#b5b5b5',
    background: state.isFocused ? 'rgba(32,39,62,0.25)' : 'transparent',
  }),
  menu: provided => ({
    ...provided,
    borderRadius: '0px',
    borderColor: '#eeeeef',
    background: '#303b62',
    zIndex: 5,
  })
};

