import { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { Keyboard, Platform, ScrollView, TextInput, View } from 'react-native';

const RevealContext = createContext(null);

/** Inputs call this when they get focus, so the scroll view can bring them above the keyboard. */
export const useKeyboardReveal = () => useContext(RevealContext);

/**
 * ScrollView that keeps the focused input visible when the keyboard opens.
 * Android draws the app edge-to-edge, so the window no longer shrinks for the keyboard: we scroll
 * the focused field (and the one next to it) into the visible area ourselves.
 * Wrap it in <KeyboardAvoidingView behavior="padding"> so the visible area ends above the keyboard.
 */
const KeyboardScroll = forwardRef(function KeyboardScroll({ children, contentContainerStyle, offset = 140, ...props }, ref) {
    const scrollRef = useRef(null);
    const contentRef = useRef(null);
    useImperativeHandle(ref, () => scrollRef.current);

    const reveal = useCallback((delay = 120) => {
        setTimeout(() => {
            const input = TextInput.State.currentlyFocusedInput();
            if (!input || !contentRef.current || !scrollRef.current) return;
            input.measureLayout(
                contentRef.current,
                (x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - offset), animated: true }),
                () => {},
            );
        }, delay);
    }, [offset]);

    // When the keyboard appears (first tap on an input), wait for the layout to settle then scroll
    useEffect(() => {
        const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const sub = Keyboard.addListener(event, () => reveal(Platform.OS === 'ios' ? 60 : 100));
        return () => sub.remove();
    }, [reveal]);

    return (
        <RevealContext.Provider value={reveal}>
            <ScrollView
                ref={scrollRef}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                {...props}
            >
                <View ref={contentRef} collapsable={false} style={[{ flexGrow: 1 }, contentContainerStyle]}>
                    {children}
                </View>
            </ScrollView>
        </RevealContext.Provider>
    );
});

export default KeyboardScroll;
