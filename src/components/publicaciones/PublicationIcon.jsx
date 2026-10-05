import car from '../../assets/publicaciones/car.svg'
import carLarge from '../../assets/publicaciones/carLarge.svg'
import calendar from '../../assets/publicaciones/calendar.svg'
import pin from '../../assets/publicaciones/pin.svg'
import pinInput from '../../assets/publicaciones/pinInput.svg'
import search from '../../assets/publicaciones/search.svg'
import plus from '../../assets/publicaciones/plus.svg'
import plusSmall from '../../assets/publicaciones/plusSmall.svg'
import left from '../../assets/publicaciones/left.svg'
import right from '../../assets/publicaciones/right.svg'
import image from '../../assets/publicaciones/image.svg'
import eye from '../../assets/publicaciones/eye.svg'
import pencil from '../../assets/publicaciones/pencil.svg'
import warning from '../../assets/publicaciones/warning.svg'
import navigation from '../../assets/publicaciones/navigation.svg'
import close from '../../assets/publicaciones/close.svg'
import check from '../../assets/publicaciones/check.svg'
import arrow from '../../assets/publicaciones/arrow.svg'

const iconos = {
  car: [car, 24], carLarge: [carLarge, 40], calendar: [calendar, 14],
  pin: [pin, 12], pinInput: [pinInput, 16], search: [search, 14],
  plus: [plus, 16], plusSmall: [plusSmall, 14], left: [left, 16], right: [right, 16],
  image: [image, 14], eye: [eye, 14], pencil: [pencil, 14], warning: [warning, 16],
  navigation: [navigation, 20], close: [close, 14], check: [check, 14], arrow: [arrow, 16],
}

export default function PublicationIcon({ nombre, className = '' }) {
  const [src, size] = iconos[nombre]
  return <img src={src} alt="" aria-hidden="true" width={size} height={size} className={'inline-block shrink-0 align-middle ' + className} />
}
