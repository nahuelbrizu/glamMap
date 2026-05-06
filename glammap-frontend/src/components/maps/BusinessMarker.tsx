import { AdvancedMarker } from "@vis.gl/react-google-maps";

interface Props {
  business: any;
  selected: boolean;
  onSelect: (business: any) => void;
}

export const BusinessMarker = ({ business, selected, onSelect }: Props) => {
  const position = business.location;

  if (!position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    console.error("Marker failed for:", business.name, "Invalid position:", position);
    return null;
  }

  const markerColor = selected ? '#13c8ec' : (business.isGoogleResult ? '#ef4444' : '#101b2a'); // Adjusted default color for potentially better contrast if needed

  return (
    <AdvancedMarker
      position={position}
      onClick={() => onSelect(business)}
      zIndex={selected ? 1000 : 1}
      aria-label={`Business: ${business.name}, Selected: ${selected ? 'Yes' : 'No'}`}
    >
      {/* Custom Pin Container */}
      <div style={{
        position: 'relative',
        width: '42px',
        height: '42px',
        backgroundColor: markerColor,
        borderRadius: '12px',
        border: '2px solid white',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: selected ? 'scale(1.2) translateY(-8px)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        
        {/* Dynamic Icon */}
        <span className="material-symbols-outlined" style={{ 
          color: 'white', 
          fontSize: '24px',
          userSelect: 'none'
        }}>
          {business.category === 'Barbería' ? 'content_cut' : 'storefront'}
        </span>
        
        {/* Bottom Triangle */}
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          marginLeft: '-6px',
          width: '12px',
          height: '12px',
          backgroundColor: markerColor,
          transform: 'rotate(45deg)',
          borderRight: '2px solid white',
          borderBottom: '2px solid white',
          zIndex: -1
        }} />

        {/* Google Result Badge (Optional) */}
        {business.isGoogleResult && !selected && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '12px',
            height: '12px',
            backgroundColor: '#4285F4',
            borderRadius: '50%',
            border: '1.5px solid white'
          }} />
        )}
      </div>
    </AdvancedMarker>
  );
};