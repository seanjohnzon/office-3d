// SUNNY always sails in bright golden daylight
function sunnyDaytimeState() {
  return {
    timeOfDay: 0.5,
    skyTopColor: '#2A7FD4',
    skyHorizonColor: '#7EC8E3',
    sunAngle: Math.PI / 2,
    sunVisible: true,
    moonVisible: false,
    ambientColor: '#FFF5E0',
    ambientIntensity: 1.2,
    dirLightIntensity: 2.2,
    starsOpacity: 0.0,
    sunColor: '#FFFFFF',
  }
}

export default function useDayNightCycle() {
  return sunnyDaytimeState()
}
