export const kalenderContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: '1em',
  padding: 0,
  listStyle: 'none',
};

export const kalenderItemElement: React.CSSProperties = {
  display: 'flex',
  gap: '0.5em',
  alignItems: 'center',
  fontSize: '1em',
  verticalAlign: 'middle',
  marginTop: '0.2em',
  overflow: 'hidden',
};

export const kalenderItemTitle: React.CSSProperties = {
  fontSize: '1em',
  fontWeight: 'bold',
  color: 'white',
  marginBottom: '0.6em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

export const line: React.CSSProperties = {
  width: '100%',
  height: '2px',
  background:
    'linear-gradient(90deg, rgba(255, 255, 255, 0), #ffffff, rgba(255, 255, 255, 0))',
  margin: '10px 0', // Abstand oberhalb und unterhalb der Linie
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Schatten unter der Linie
};
