import { useLocalSearchParams } from 'expo-router';
import ListingForm from '../../../components/cars/ListingForm';

export default function EditListing() {
    const { id } = useLocalSearchParams();
    return <ListingForm carId={id} />;
}
