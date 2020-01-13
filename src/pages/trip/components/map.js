import React, { Component, createRef } from 'react'

const GOOGLE_MAP_API_KEY = 'AIzaSyAh3Dzo3-VFymDTgvQI28NVqfa0qOx05cc'
export default class GoogleMap extends Component {
  googleMapRef = React.createRef()
  state = {
    markers: []
  }

  componentDidMount() {
    const googleScript = document.createElement('script')
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=places`
    window.document.body.appendChild(googleScript)

    googleScript.addEventListener('load', () => {
      this.googleMap = this.createGoogleMap()

      this.props.locations.map(({ loc }) => {
        this.createMarker(loc)
      })
      this.createPolyline(this.googleMap)
    })
  }

  createGoogleMap = () =>
    new window.google.maps.Map(this.googleMapRef.current, {
      zoom: 16,
      center: this.props.locations[0].loc,
      disableDefaultUI: true,
    })

  createPolyline = map => {
    const polyline = new window.google.maps.Polyline({ path: this.props.locations })
    polyline.setMap(map)
  }

  createMarker = ({ lat, lng }) => {
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: this.googleMap,
    })
    this.setState({
      markers: [...this.state.markers, marker]
    })
  }

  render() {
    return (
      <div
        id="google-map"
        ref={this.googleMapRef}
        style={{ width: '100%', height: '300px' }}
      />
    )
  }
}
