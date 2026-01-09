import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

const Marker = ({ text, type }) => (
  <div style={{
    color: 'white', 
    background: type === 'end' ? '#fd3995' : '#5d78ff',
    padding: '4px 8px', 
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    transform: 'translate(-50%, -100%)',
    whiteSpace: 'nowrap'
  }}>
    <i className={`fas fa-${type === 'end' ? 'bus' : 'map-marker-alt'}`}></i> {text}
  </div>
);

class Map extends Component {
  static defaultProps = {
    center: {
      lat: -1.286389, // Default Nairobi/Kenya coordinates
      lng: 36.817223
    },
    zoom: 14
  };

  handleApiLoaded = (map, maps) => {
    const { locations } = this.props;

    if (locations && locations.length > 1) {
      // 1. Create coordinates array
      const pathCoordinates = locations.map(l => ({
        lat: l.loc.lat,
        lng: l.loc.lng
      }));

      // 2. Draw Polyline (The Route)
      const flightPath = new maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#5d78ff",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      flightPath.setMap(map);

      // 3. Auto-center map bounds to fit the route
      const bounds = new maps.LatLngBounds();
      pathCoordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);
    }
  };

  render() {
    const { locations } = this.props;
    
    // Determine start and current/end positions
    const startLoc = locations && locations.length > 0 ? locations[locations.length - 1].loc : this.props.center;
    const currentLoc = locations && locations.length > 0 ? locations[0].loc : this.props.center;

    return (
      <div style={{ height: '100%', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "YOUR_GOOGLE_MAPS_API_KEY" }} // REPLACE THIS
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
        >
          {/* Start Point */}
          {locations && locations.length > 0 && (
             <Marker
               lat={startLoc.lat}
               lng={startLoc.lng}
               text="Start"
               type="start"
             />
          )}

          {/* Current Bus Position */}
          {locations && locations.length > 0 && (
             <Marker
               lat={currentLoc.lat}
               lng={currentLoc.lng}
               text="Current"
               type="end"
             />
          )}
        </GoogleMapReact>
      </div>
    );
  }
}

export default Map;