import BookingsScreen from '../../components/booking/BookingsScreen';

/** Owner side: booking requests for my cars (new, confirmed, history). */
export default function Requests() {
    return <BookingsScreen role="owner" />;
}
