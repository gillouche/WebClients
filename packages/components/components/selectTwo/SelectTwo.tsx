import React, { useState, useRef, useEffect, useMemo } from 'react';
import isDeepEqual from 'proton-shared/lib/helpers/isDeepEqual';

import { Dropdown, DropdownButton } from '../dropdown';
import { Props as DropdownButtonProps } from '../dropdown/DropdownButton';
import { Props as OptionProps } from '../option/Option';

export type FakeSelectChangeEvent<V> = {
    value: V;
    selectedIndex: number;
};

export interface Props<V>
    extends Omit<DropdownButtonProps, 'value' | 'onClick' | 'onChange' | 'onKeyDown' | 'aria-label'> {
    value?: V;
    isOpen?: boolean;
    children: React.ReactElement<OptionProps<V>>[];
    clearSearchAfter?: number;
    getSearchableValue?: (value: V) => string;
    onChange?: (e: FakeSelectChangeEvent<V>) => void;
    onClose?: () => void;
    onOpen?: () => void;
}

const Select = <V extends any>({
    children,
    value,
    placeholder,
    isOpen: controlledOpen,
    onClose,
    onOpen,
    onChange: onChangeProp,
    clearSearchAfter = 500,
    getSearchableValue,
    ...rest
}: Props<V>) => {
    const anchorRef = useRef<HTMLButtonElement | null>(null);

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const [search, setSearch] = useState('');

    const searchClearTimeout = useRef<number | undefined>(undefined);

    const isControlled = controlledOpen !== undefined;

    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const allOptionValues = children.map((child) => child.props.value);

    /*
     * Natural search-ability determined by whether or not all option values
     * from the passed children are strings, there's also "unnatural" search-ability
     * if the prop "getSearchableValue" is passed
     */
    const isNaturallySearchable = allOptionValues.every((child) => typeof child === 'string');

    const isSearchable = isNaturallySearchable || Boolean(getSearchableValue);

    const selectedIndex = useMemo(() => {
        const index = children.findIndex((child) => child.props.value === value);

        return index !== -1 ? index : null;
    }, [children, value]);

    useEffect(() => {
        if (!search) {
            return;
        }

        if (!isSearchable) {
            return;
        }

        window.clearTimeout(searchClearTimeout.current);

        searchClearTimeout.current = window.setTimeout(() => {
            setSearch('');
        }, clearSearchAfter);

        /*
         * either getSearchableValue is provided or the values are naturally
         * searchable meaning that they are all strings, therefore this
         * type-cast is a safe assumption here
         */
        const indexOfMatchedOption = allOptionValues.findIndex((v) =>
            (getSearchableValue?.(v) || String(v)).startsWith(search)
        );

        if (indexOfMatchedOption !== -1) {
            setFocusedIndex(indexOfMatchedOption);
        }
    }, [search]);

    const open = () => {
        if (isControlled) {
            onOpen?.();
        } else {
            setUncontrolledOpen(true);
        }

        setFocusedIndex(selectedIndex || 0);
    };

    const close = () => {
        if (isControlled) {
            onClose?.();
        } else {
            setUncontrolledOpen(false);
        }
    };

    const goToPreviousItem = () => {
        if (focusedIndex !== null && focusedIndex !== 0) {
            setFocusedIndex(focusedIndex - 1);
        }
    };

    const goToNextItem = () => {
        if (focusedIndex !== null && focusedIndex !== children.length - 1) {
            setFocusedIndex(focusedIndex + 1);
        }
    };

    const handleAnchorClick = () => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    };

    const handleAnchorKeydown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        switch (e.key) {
            case ' ': {
                open();
                break;
            }

            default:
        }
    };

    const handleChange = (event: FakeSelectChangeEvent<V>) => {
        onChangeProp?.(event);
    };

    const handleMenuKeydown = (e: React.KeyboardEvent<HTMLUListElement>) => {
        switch (e.key) {
            case 'ArrowUp': {
                e.preventDefault();
                goToPreviousItem();
                break;
            }

            case 'ArrowDown': {
                e.preventDefault();
                goToNextItem();
                break;
            }

            case 'Escape': {
                close();
                anchorRef.current?.focus();
                break;
            }

            default:
        }

        const isAlphanumeric = /^[a-z0-9]+$/i.test(e.key);

        /*
         * The e.key.length === 1 thing is super hacky and is supposed
         * to prevent event keys such as 'Shift' / 'ArrowUp' etc. from
         * being tracked here.
         *
         * A better solution might be needed.
         */
        if (isAlphanumeric && isSearchable && e.key.length === 1) {
            const { key } = e;

            setSearch((s) => s + key);
        }
    };

    const handleChildChange = (index: number) => (value: V) => {
        handleChange({ value, selectedIndex: index });
    };

    const items = React.Children.map(children, (child, index) => {
        const childValue = children[index].props.value;

        const selected = isDeepEqual(childValue, value);

        return React.cloneElement(child, {
            selected,
            active: focusedIndex === index,
            onChange: handleChildChange(index),
        });
    });

    const selectedChild = selectedIndex || selectedIndex === 0 ? children[selectedIndex] : null;

    const displayedValue = selectedChild?.props?.children || selectedChild?.props?.title || placeholder;

    const ariaLabel = selectedChild?.props?.title;

    return (
        <>
            <DropdownButton
                className="alignleft w100 ellipsis no-outline pm-select pm-button"
                isOpen={isOpen}
                hasCaret
                buttonRef={anchorRef}
                caretClassName="mtauto mbauto"
                onClick={handleAnchorClick}
                onKeyDown={handleAnchorKeydown}
                aria-live="assertive"
                aria-atomic="true"
                aria-label={ariaLabel}
                {...rest}
            >
                {displayedValue}
            </DropdownButton>

            <Dropdown
                isOpen={isOpen}
                anchorRef={anchorRef}
                onClose={close}
                offset={4}
                noCaret
                noMaxWidth
                sameAnchorWidth
            >
                <ul className="unstyled m0 p0" onKeyDown={handleMenuKeydown} data-testid="select-list">
                    {items}
                </ul>
            </Dropdown>
        </>
    );
};

export default Select;
