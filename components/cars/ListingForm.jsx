import { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInLeft, FadeIn, ZoomIn, useAnimatedStyle, withSpring, LinearTransition } from 'react-native-reanimated';
import Text from '../ui/AppText';
import Header from '../ui/Header';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import TextField from '../ui/TextField';
import PressableScale from '../ui/PressableScale';
import IconButton from '../ui/IconButton';
import KeyboardScroll from '../ui/KeyboardScroll';
import { api } from '../../lib/api';
import { pickImage, uploadImage } from '../../lib/images';
import { toast } from '../../store/toastStore';
import { useModeStore } from '../../store/modeStore';
import { theme } from '../../constants/theme';
import { CITIES, TRANSMISSIONS, FUEL_TYPES, FEATURES, CURRENCY, formatMoney } from '../../constants/app';
import { dialog } from '../../store/dialogStore';

const STEPS = [
    { key: 'basics', title: 'The basics', subtitle: 'Which car are you listing?' },
    { key: 'specs', title: 'Specs & features', subtitle: 'Help renters pick the right car' },
    { key: 'photos', title: 'Photos', subtitle: 'Bright, clear photos get more bookings' },
    { key: 'price', title: 'Price & description', subtitle: 'Set your daily price' },
];

const MAX_PHOTOS = 8;
const { width } = Dimensions.get('window');
const TILE = (width - 40 - 20) / 3;
const CURRENT_YEAR = new Date().getFullYear();

const EMPTY = {
    brand: '', model: '', year: '', city: '', transmission: 'automatic', fuelType: 'petrol', seats: 5,
    features: [], photos: [], pricePerDay: '', description: '',
};

function ProgressBar({ step }) {
    const [trackWidth, setTrackWidth] = useState(0);
    const style = useAnimatedStyle(() => ({
        width: withSpring((trackWidth * (step + 1)) / STEPS.length, { damping: 18 }),
    }), [step, trackWidth]);
    return (
        <View onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)} style={{ height: 6, borderRadius: 3, backgroundColor: theme.surface2, overflow: 'hidden' }}>
            <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: theme.accent }, style]} />
        </View>
    );
}

const Label = ({ children }) => <Text weight="bold" style={{ color: theme.text, fontSize: 15, marginBottom: 12 }}>{children}</Text>;

/** Create or edit a listing. `carId` switches to edit mode. */
export default function ListingForm({ carId }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const editing = !!carId;
    const [form, setForm] = useState(EMPTY);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!editing) return;
        api(`/cars/${carId}`).then(car => {
            setForm({
                brand: car.brand, model: car.model, year: String(car.year), city: car.city,
                transmission: car.transmission, fuelType: car.fuelType, seats: car.seats,
                features: car.features || [], photos: car.photos.map(p => ({ ...p, key: p.publicId || p.url })),
                pricePerDay: String(car.pricePerDay), description: car.description,
            });
        }).catch(e => {
            dialog.alert('Error', e.message);
            router.back();
        }).finally(() => setLoading(false));
    }, [carId, editing, router]);

    const set = (patch) => {
        setForm(f => ({ ...f, ...patch }));
        setErrors(e => {
            const next = { ...e };
            Object.keys(patch).forEach(k => delete next[k]);
            return next;
        });
    };

    const validateStep = (s) => {
        const e = {};
        const year = Number(form.year);
        if (s === 0) {
            if (form.brand.trim().length < 2) e.brand = 'Enter the brand (e.g. Dacia)';
            if (!form.model.trim()) e.model = 'Enter the model (e.g. Duster)';
            if (!Number.isInteger(year) || year < 1950 || year > CURRENT_YEAR + 1) e.year = `Year between 1950 and ${CURRENT_YEAR + 1}`;
            if (form.city.trim().length < 2) e.city = 'Where can renters pick it up?';
        }
        if (s === 2) {
            if (!form.photos.length) e.photos = 'Add at least one photo';
            if (form.photos.some(p => p.uploading)) e.photos = 'Wait for the photos to finish uploading';
        }
        if (s === 3) {
            const price = Number(form.pricePerDay);
            if (!price || price < 1 || price > 100000) e.pricePerDay = 'Enter a daily price';
            const len = form.description.trim().length;
            if (len < 20) e.description = `Write at least 20 characters (${len}/20)`;
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const go = (delta) => {
        if (delta > 0 && !validateStep(step)) return;
        setDirection(delta);
        setStep(s => s + delta);
    };

    const addPhoto = async () => {
        if (form.photos.length >= MAX_PHOTOS) return;
        const picked = await pickImage({ aspect: [4, 3], title: 'Add a car photo' });
        if (!picked) return;
        const key = `${Date.now()}`;
        setForm(f => ({ ...f, photos: [...f.photos, { key, url: picked.uri, uploading: true }] }));
        setErrors(e => ({ ...e, photos: null }));
        try {
            const uploaded = await uploadImage(picked.dataUrl, 'car');
            setForm(f => ({ ...f, photos: f.photos.map(p => p.key === key ? { ...uploaded, key, localUri: picked.uri } : p) }));
        } catch (e) {
            setForm(f => ({ ...f, photos: f.photos.filter(p => p.key !== key) }));
            dialog.alert('Upload failed', e.message);
        }
    };

    const removePhoto = (key) => setForm(f => ({ ...f, photos: f.photos.filter(p => p.key !== key) }));
    const makeCover = (key) => setForm(f => {
        const photo = f.photos.find(p => p.key === key);
        return { ...f, photos: [photo, ...f.photos.filter(p => p.key !== key)] };
    });

    const submit = async () => {
        if (!validateStep(3)) return;
        setSaving(true);
        const body = {
            brand: form.brand.trim(), model: form.model.trim(), year: Number(form.year), city: form.city.trim(),
            transmission: form.transmission, fuelType: form.fuelType, seats: Number(form.seats),
            features: form.features, pricePerDay: Number(form.pricePerDay), description: form.description.trim(),
            photos: form.photos.map(p => ({ url: p.url, publicId: p.publicId || '' })),
        };
        try {
            const car = editing
                ? await api(`/cars/${carId}`, { method: 'PUT', body })
                : await api('/cars', { method: 'POST', body });
            if (editing) {
                toast.success('Listing updated');
                router.back();
            } else {
                // Listing a car makes you a host: open the owner side when you come back from the car page
                if (useModeStore.getState().mode !== 'owner') {
                    useModeStore.getState().setMode('owner');
                    toast.success('Your car is live! 🎉 You are now in owner mode.');
                } else {
                    toast.success('Your car is live! 🎉');
                }
                router.replace(`/car/${car._id}`);
            }
        } catch (e) {
            dialog.alert('Could not save', e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={{ flex: 1, backgroundColor: theme.canvas, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.text} size="large" /></View>;
    }

    const entering = direction > 0 ? FadeInRight.duration(280) : FadeInLeft.duration(280);
    const current = STEPS[step];

    return (
        <View style={{ flex: 1, backgroundColor: theme.canvas, paddingTop: insets.top }}>
            <Header kicker={editing ? 'Edit your' : 'List your'} title="Car" icon="car-sport" />

            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: theme.paper, borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 6, overflow: 'hidden' }}>
                    <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 14 }}>
                        <ProgressBar step={step} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Animated.View key={current.key} entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                                <Text weight="extrabold" style={{ color: theme.text, fontSize: 24 }}>{current.title}</Text>
                                <Text style={{ color: theme.muted, fontSize: 14, marginTop: 2 }}>{current.subtitle}</Text>
                            </Animated.View>
                            <Text weight="bold" style={{ color: theme.accentDeep, fontSize: 14 }}>{step + 1}/{STEPS.length}</Text>
                        </View>
                    </View>

                    <KeyboardScroll contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
                        <Animated.View key={step} entering={entering} style={{ gap: 18 }}>
                            {step === 0 ? (
                                <>
                                    <TextField label="Brand" icon="car-outline" placeholder="e.g. Dacia" value={form.brand} onChangeText={(v) => set({ brand: v })} autoCapitalize="words" error={errors.brand} />
                                    <TextField label="Model" icon="pricetag-outline" placeholder="e.g. Duster" value={form.model} onChangeText={(v) => set({ model: v })} error={errors.model} />
                                    <TextField label="Year" icon="calendar-outline" placeholder={String(CURRENT_YEAR)} keyboardType="number-pad" maxLength={4}
                                        value={form.year} onChangeText={(v) => set({ year: v.replace(/[^0-9]/g, '') })} error={errors.year} />
                                    <TextField label="City" icon="location-outline" placeholder="Where is the car?" value={form.city} onChangeText={(v) => set({ city: v })} autoCapitalize="words" error={errors.city} />
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
                                        {CITIES.map(c => <Chip key={c} label={c} selected={form.city === c} onPress={() => set({ city: c })} />)}
                                    </ScrollView>
                                </>
                            ) : null}

                            {step === 1 ? (
                                <>
                                    <View>
                                        <Label>Transmission</Label>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {TRANSMISSIONS.map(t => <Chip key={t.value} label={t.label} icon={t.icon} selected={form.transmission === t.value} onPress={() => set({ transmission: t.value })} />)}
                                        </View>
                                    </View>
                                    <View>
                                        <Label>Fuel type</Label>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {FUEL_TYPES.map(t => <Chip key={t.value} label={t.label} icon={t.icon} selected={form.fuelType === t.value} onPress={() => set({ fuelType: t.value })} />)}
                                        </View>
                                    </View>
                                    <View>
                                        <Label>Seats</Label>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.canvas, borderRadius: 999, padding: 6 }}>
                                            <IconButton icon="remove" variant="white" size={48} onPress={() => set({ seats: Math.max(1, form.seats - 1) })} accessibilityLabel="Fewer seats" />
                                            <Animated.View key={form.seats} entering={ZoomIn.springify().damping(12)}>
                                                <Text weight="extrabold" style={{ color: theme.text, fontSize: 22 }}>{form.seats} seats</Text>
                                            </Animated.View>
                                            <IconButton icon="add" variant="accent" size={48} onPress={() => set({ seats: Math.min(9, form.seats + 1) })} accessibilityLabel="More seats" />
                                        </View>
                                    </View>
                                    <View>
                                        <Label>Features</Label>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {FEATURES.map(f => {
                                                const on = form.features.includes(f.value);
                                                return (
                                                    <Chip key={f.value} label={f.label} icon={f.icon} selected={on}
                                                        onPress={() => set({ features: on ? form.features.filter(x => x !== f.value) : [...form.features, f.value] })} />
                                                );
                                            })}
                                        </View>
                                    </View>
                                </>
                            ) : null}

                            {step === 2 ? (
                                <>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                        {form.photos.map((p, i) => (
                                            <Animated.View key={p.key} entering={ZoomIn.springify().damping(14)} layout={LinearTransition.springify()}>
                                                <PressableScale onPress={() => i > 0 && makeCover(p.key)} accessibilityLabel={i === 0 ? 'Cover photo' : 'Set as cover photo'}
                                                    style={{ width: TILE, height: TILE, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.surface2 }}>
                                                    <Image source={{ uri: p.localUri || p.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                                    {p.uploading ? (
                                                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                                                            <ActivityIndicator color={theme.onInk} />
                                                        </View>
                                                    ) : null}
                                                    {i === 0 && !p.uploading ? (
                                                        <View style={{ position: 'absolute', left: 6, bottom: 6, backgroundColor: theme.accent, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                                                            <Text weight="bold" style={{ color: theme.onAccent, fontSize: 10 }}>COVER</Text>
                                                        </View>
                                                    ) : null}
                                                </PressableScale>
                                                {!p.uploading ? (
                                                    <View style={{ position: 'absolute', top: -6, right: -6 }}>
                                                        <IconButton icon="close" variant="ink" size={28} onPress={() => removePhoto(p.key)} accessibilityLabel="Remove photo" />
                                                    </View>
                                                ) : null}
                                            </Animated.View>
                                        ))}
                                        {form.photos.length < MAX_PHOTOS ? (
                                            <PressableScale onPress={addPhoto} haptic accessibilityLabel="Add photo"
                                                style={{ width: TILE, height: TILE, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: errors.photos ? theme.danger : theme.surface3, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Ionicons name="camera" size={20} color={theme.onAccent} />
                                                </View>
                                                <Text weight="semibold" style={{ color: theme.textSoft, fontSize: 12 }}>{form.photos.length}/{MAX_PHOTOS}</Text>
                                            </PressableScale>
                                        ) : null}
                                    </View>
                                    {errors.photos ? <Text style={{ color: theme.danger, fontSize: 13 }}>{errors.photos}</Text> : null}
                                    <View style={{ backgroundColor: theme.accentSoft, borderRadius: 22, padding: 16, flexDirection: 'row', gap: 12 }}>
                                        <Ionicons name="bulb-outline" size={22} color={theme.accentDeep} />
                                        <Text style={{ color: theme.textSoft, fontSize: 13, lineHeight: 19, flex: 1 }}>
                                            Tap a photo to make it the cover. Show the front, the side, the interior and the boot.
                                        </Text>
                                    </View>
                                </>
                            ) : null}

                            {step === 3 ? (
                                <>
                                    <TextField label="Price per day" icon="cash-outline" placeholder="350" keyboardType="number-pad" suffix={`${CURRENCY} / day`}
                                        value={form.pricePerDay} onChangeText={(v) => set({ pricePerDay: v.replace(/[^0-9]/g, '').slice(0, 6) })} error={errors.pricePerDay} />
                                    {Number(form.pricePerDay) > 0 ? (
                                        <Animated.View entering={FadeIn} style={{ backgroundColor: theme.accent, borderRadius: 24, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View>
                                                <Text weight="semibold" style={{ color: theme.onAccentMuted, fontSize: 13 }}>A 3-day weekend earns you</Text>
                                                <Text weight="extrabold" style={{ color: theme.onAccent, fontSize: 24 }}>{formatMoney(Number(form.pricePerDay) * 3)}</Text>
                                            </View>
                                            <Ionicons name="trending-up" size={34} color={theme.onAccent} />
                                        </Animated.View>
                                    ) : null}
                                    <TextField label="Description" multiline placeholder="Condition, rules, pick-up spot, what makes it special…" maxLength={1500}
                                        value={form.description} onChangeText={(v) => set({ description: v })} error={errors.description}
                                        hint={`${form.description.trim().length}/1500`} />
                                </>
                            ) : null}
                        </Animated.View>
                    </KeyboardScroll>

                    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderColor: theme.line }}>
                        {step > 0 ? (
                            <View style={{ flex: 1 }}>
                                <Button title="Back" variant="outline" icon="arrow-back" onPress={() => go(-1)} />
                            </View>
                        ) : null}
                        <View style={{ flex: 2 }}>
                            {step < STEPS.length - 1 ? (
                                <Button title="Continue" iconRight="arrow-forward" onPress={() => go(1)} />
                            ) : (
                                <Button title={editing ? 'Save changes' : 'Publish listing'} icon="checkmark" loading={saving} onPress={submit} />
                            )}
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
