(function(wp) {
    const { registerBlockType } = wp.blocks;
    const { useBlockProps, InspectorControls, ColorPalette, MediaUpload, MediaUploadCheck } = wp.blockEditor;
    const { Button, PanelBody, TextControl, SelectControl, Modal, RangeControl, BaseControl, CheckboxControl } = wp.components;
    const { __ } = wp.i18n;
    const { createElement: el, useState, useRef, Fragment } = wp.element;

    registerBlockType('giant-header/navigation-menu', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { menuItems, parentFontSize, childFontSize, parentColor, childColor, activeColor, chevronIcon, chevronSize } = attributes;
            const [isModalOpen, setIsModalOpen] = useState(false);

            const navStyle = {};
            if (parentFontSize) navStyle['--parent-font-size'] = parentFontSize + 'px';
            if (childFontSize) navStyle['--child-font-size'] = childFontSize + 'px';
            if (parentColor) navStyle['--parent-color'] = parentColor;
            if (childColor) navStyle['--child-color'] = childColor;
            if (activeColor) navStyle['--active-color'] = activeColor;
            navStyle['--chevron-size'] = (chevronSize || '20') + 'px';
            if (chevronIcon && chevronIcon.url) navStyle['--chevron-url'] = "url('" + chevronIcon.url + "')";
            const blockProps = useBlockProps({ className: 'nav-outer', style: navStyle });

            // ── Menu item helpers ──────────────────────────────────────────

            const addMenuItem = function() {
                setAttributes({ menuItems: [...menuItems, {
                    id: Date.now(),
                    type: 'link',
                    title: '',
                    url: '',
                    newTab: false,
                    subMenus: [{ id: Date.now() + 1, heading: '', childItems: [] }]
                }]});
            };

            const updateMenuItem = function(index, field, value) {
                const updated = menuItems.map(function(item, i) {
                    return i === index ? Object.assign({}, item, { [field]: value }) : item;
                });
                setAttributes({ menuItems: updated });
            };

            const removeMenuItem = function(index) {
                setAttributes({ menuItems: menuItems.filter(function(_, i) { return i !== index; }) });
            };

            const moveMenuItemUp = function(index) {
                if (index === 0) return;
                const updated = [...menuItems];
                const temp = updated[index];
                updated[index] = updated[index - 1];
                updated[index - 1] = temp;
                setAttributes({ menuItems: updated });
            };

            const moveMenuItemDown = function(index) {
                if (index === menuItems.length - 1) return;
                const updated = [...menuItems];
                const temp = updated[index];
                updated[index] = updated[index + 1];
                updated[index + 1] = temp;
                setAttributes({ menuItems: updated });
            };

            // ── Child item helpers (always uses subMenus[0]) ───────────────

            const getChildren = function(item) {
                if (!item.subMenus || !item.subMenus[0]) return [];
                return item.subMenus[0].childItems || [];
            };

            const addChildItem = function(itemIndex) {
                const updated = menuItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const subMenu0 = (item.subMenus && item.subMenus[0])
                        ? Object.assign({}, item.subMenus[0])
                        : { id: Date.now(), heading: '', childItems: [] };
                    subMenu0.childItems = [...(subMenu0.childItems || []), { id: Date.now() + 2, name: '', url: '', newTab: false }];
                    return Object.assign({}, item, { subMenus: [subMenu0] });
                });
                setAttributes({ menuItems: updated });
            };

            const updateChildItem = function(itemIndex, childIndex, field, value) {
                const updated = menuItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const subMenu0 = Object.assign({}, item.subMenus[0]);
                    subMenu0.childItems = (subMenu0.childItems || []).map(function(child, ci) {
                        return ci === childIndex ? Object.assign({}, child, { [field]: value }) : child;
                    });
                    return Object.assign({}, item, { subMenus: [subMenu0] });
                });
                setAttributes({ menuItems: updated });
            };

            const removeChildItem = function(itemIndex, childIndex) {
                const updated = menuItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const subMenu0 = Object.assign({}, item.subMenus[0]);
                    subMenu0.childItems = (subMenu0.childItems || []).filter(function(_, ci) { return ci !== childIndex; });
                    return Object.assign({}, item, { subMenus: [subMenu0] });
                });
                setAttributes({ menuItems: updated });
            };

            const reorderChildItems = function(itemIndex, fromIndex, toIndex) {
                if (fromIndex === toIndex) return;
                const updated = menuItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const subMenu0 = Object.assign({}, item.subMenus[0]);
                    const children = [...(subMenu0.childItems || [])];
                    const moved = children.splice(fromIndex, 1)[0];
                    children.splice(toIndex, 0, moved);
                    subMenu0.childItems = children;
                    return Object.assign({}, item, { subMenus: [subMenu0] });
                });
                setAttributes({ menuItems: updated });
            };

            const dragRef = useRef(null);

            // ── Shared styles ──────────────────────────────────────────────

            const s = {
                card: {
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                },
                cardHeader: {
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    gap: '6px'
                },
                badge: {
                    display: 'inline-block',
                    marginLeft: '8px',
                    fontSize: '11px',
                    background: '#e8e8e8',
                    color: '#555',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 400
                },
                childrenBox: {
                    background: '#f8f9fa',
                    border: '1px solid #e4e6ea',
                    borderRadius: '8px',
                    padding: '14px',
                    marginTop: '4px'
                },
                childRow: {
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr 1fr auto auto',
                    gap: '10px',
                    alignItems: 'end',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    marginBottom: '8px',
                    transition: 'opacity 0.15s'
                },
                childRowDragging: {
                    opacity: 0.4
                },
                childRowOver: {
                    borderColor: '#007cba',
                    background: '#f0f7fb'
                },
                dragHandle: {
                    alignSelf: 'flex-end',
                    paddingBottom: '8px',
                    cursor: 'grab',
                    color: '#aaa',
                    fontSize: '16px',
                    lineHeight: 1,
                    userSelect: 'none'
                },
                noItems: {
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#999',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
                modalFooter: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    marginTop: '12px',
                    borderTop: '1px solid #e0e0e0'
                },
                fieldRow2: function(hasUrl) {
                    return {
                        display: 'grid',
                        gridTemplateColumns: hasUrl ? '200px 1fr 1fr' : '200px 1fr',
                        gap: '12px',
                        alignItems: 'start'
                    };
                }
            };

            const typeLabel = function(type) {
                if (type === 'parent-with-url') return 'Parent + URL';
                if (type === 'parent-no-url') return 'Parent';
                return 'Link';
            };

            // ── Modal ──────────────────────────────────────────────────────

            const renderModal = function() {
                return el(Modal, {
                    title: __('Menu Editor'),
                    onRequestClose: function() { setIsModalOpen(false); },
                    className: 'giant-header-menu-modal'
                },
                    el('div', { style: { width: '100%', minWidth: '600px' } },
                        // Scrollable items area
                        el('div', { style: { maxHeight: '60vh', overflowY: 'auto', paddingRight: '2px' } },
                            menuItems.length === 0 ?
                                el('div', { style: s.noItems },
                                    el('p', { style: { fontWeight: 600, color: '#333', marginBottom: '4px' } }, __('Your menu is empty')),
                                    el('p', null, __('Click "+ Add Menu Item" below to get started.'))
                                ) :
                                menuItems.map(function(item, itemIndex) {
                                    const children = getChildren(item);

                                    return el('div', { key: item.id, style: s.card },

                                        // ── Card header ──
                                        el('div', { style: s.cardHeader },
                                            el('span', { style: { flex: 1, fontWeight: 700, fontSize: '15px', color: '#1e1e1e' } },
                                                item.title || __('(Untitled)'),
                                                el('span', { style: s.badge }, typeLabel(item.type))
                                            ),
                                            el(Button, { isSmall: true, variant: 'tertiary', title: __('Move up'),
                                                disabled: itemIndex === 0,
                                                onClick: function() { moveMenuItemUp(itemIndex); }
                                            }, '↑'),
                                            el(Button, { isSmall: true, variant: 'tertiary', title: __('Move down'),
                                                disabled: itemIndex === menuItems.length - 1,
                                                onClick: function() { moveMenuItemDown(itemIndex); }
                                            }, '↓'),
                                            el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', title: __('Remove'),
                                                onClick: function() { removeMenuItem(itemIndex); }
                                            }, '✕ Remove')
                                        ),

                                        // ── Type + Title + URL ──
                                        el('div', { style: s.fieldRow2(item.type !== 'parent-no-url') },
                                            el(SelectControl, {
                                                label: __('Type'),
                                                value: item.type,
                                                options: [
                                                    { label: __('Simple Link'), value: 'link' },
                                                    { label: __('Parent with URL'), value: 'parent-with-url' },
                                                    { label: __('Parent without URL'), value: 'parent-no-url' }
                                                ],
                                                onChange: function(value) { updateMenuItem(itemIndex, 'type', value); }
                                            }),
                                            el(TextControl, {
                                                label: __('Title'),
                                                value: item.title,
                                                onChange: function(value) { updateMenuItem(itemIndex, 'title', value); },
                                                placeholder: __('e.g. About Us')
                                            }),
                                            item.type !== 'parent-no-url' && el(TextControl, {
                                                label: __('URL'),
                                                value: item.url,
                                                onChange: function(value) { updateMenuItem(itemIndex, 'url', value); },
                                                placeholder: 'https://'
                                            })
                                        ),
                                        item.type !== 'parent-no-url' && el(CheckboxControl, {
                                            label: __('Open in new tab'),
                                            checked: !!item.newTab,
                                            onChange: function(value) { updateMenuItem(itemIndex, 'newTab', value); },
                                            style: { marginTop: '4px', marginBottom: '8px' }
                                        }),

                                        // ── Children (parent types only) ──
                                        item.type !== 'link' && el('div', { style: s.childrenBox },
                                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: children.length ? '12px' : '0' } },
                                                el('span', { style: { fontWeight: 600, fontSize: '13px', color: '#444' } },
                                                    __('Child Items') + (children.length ? ' (' + children.length + ')' : '')
                                                ),
                                                el(Button, { variant: 'secondary', isSmall: true,
                                                    onClick: function() { addChildItem(itemIndex); }
                                                }, __('+ Add Child'))
                                            ),

                                            children.length > 0 && children.map(function(child, childIndex) {
                                                return el('div', {
                                                    key: child.id,
                                                    style: s.childRow,
                                                    draggable: true,
                                                    onDragStart: function(e) {
                                                        dragRef.current = { itemIndex: itemIndex, fromIndex: childIndex };
                                                        e.dataTransfer.effectAllowed = 'move';
                                                        e.currentTarget.style.opacity = '0.4';
                                                    },
                                                    onDragEnd: function(e) {
                                                        e.currentTarget.style.opacity = '';
                                                        e.currentTarget.style.borderColor = '';
                                                        e.currentTarget.style.background = '';
                                                    },
                                                    onDragOver: function(e) {
                                                        e.preventDefault();
                                                        e.dataTransfer.dropEffect = 'move';
                                                        e.currentTarget.style.borderColor = '#007cba';
                                                        e.currentTarget.style.background = '#f0f7fb';
                                                    },
                                                    onDragLeave: function(e) {
                                                        e.currentTarget.style.borderColor = '';
                                                        e.currentTarget.style.background = '';
                                                    },
                                                    onDrop: function(e) {
                                                        e.preventDefault();
                                                        e.currentTarget.style.borderColor = '';
                                                        e.currentTarget.style.background = '';
                                                        var drag = dragRef.current;
                                                        if (drag && drag.itemIndex === itemIndex) {
                                                            reorderChildItems(itemIndex, drag.fromIndex, childIndex);
                                                        }
                                                        dragRef.current = null;
                                                    }
                                                },
                                                    el('div', { style: s.dragHandle, title: __('Drag to reorder') }, '⠿'),
                                                    el(TextControl, {
                                                        label: __('Label'),
                                                        value: child.name,
                                                        onChange: function(v) { updateChildItem(itemIndex, childIndex, 'name', v); },
                                                        placeholder: __('Link text')
                                                    }),
                                                    el(TextControl, {
                                                        label: __('URL'),
                                                        value: child.url,
                                                        onChange: function(v) { updateChildItem(itemIndex, childIndex, 'url', v); },
                                                        placeholder: 'https://'
                                                    }),
                                                    el('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4px' } },
                                                        el(CheckboxControl, {
                                                            label: __('New tab'),
                                                            checked: !!child.newTab,
                                                            onChange: function(v) { updateChildItem(itemIndex, childIndex, 'newTab', v); }
                                                        })
                                                    ),
                                                    el(Button, {
                                                        isDestructive: true, isSmall: true, variant: 'tertiary',
                                                        title: __('Remove child'),
                                                        onClick: function() { removeChildItem(itemIndex, childIndex); },
                                                        style: { alignSelf: 'flex-end', marginBottom: '2px' }
                                                    }, '✕')
                                                );
                                            })
                                        )
                                    );
                                })
                        ),

                        // ── Modal footer ──
                        el('div', { style: s.modalFooter },
                            el(Button, { variant: 'primary', onClick: addMenuItem }, __('+ Add Menu Item')),
                            el(Button, { variant: 'secondary', onClick: function() { setIsModalOpen(false); } }, __('Done'))
                        )
                    )
                );
            };

            // ── Render ─────────────────────────────────────────────────────

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Navigation Menu'), initialOpen: true },
                        el('p', { style: { color: '#666', fontSize: '13px', marginBottom: '12px' } },
                            menuItems.length === 0
                                ? __('No menu items configured yet.')
                                : menuItems.length + ' item' + (menuItems.length !== 1 ? 's' : '') + ' configured'
                        ),
                        el(Button, {
                            variant: 'primary',
                            onClick: function() { setIsModalOpen(true); },
                            style: { width: '100%', justifyContent: 'center' }
                        }, __('✏ Edit Menu'))
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        // Parent items
                        el('p', { style: { fontWeight: 600, marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', color: '#757575' } }, __('Parent Items')),
                        el(RangeControl, {
                            label: __('Font Size (px)'),
                            value: parseInt(parentFontSize, 10) || 28,
                            min: 12,
                            max: 60,
                            step: 1,
                            onChange: function(value) { setAttributes({ parentFontSize: String(value) }); }
                        }),
                        el(BaseControl, { label: __('Color') },
                            el(ColorPalette, {
                                value: parentColor,
                                onChange: function(color) { setAttributes({ parentColor: color || '#ffffff' }); },
                                colors: [
                                    { name: 'White', color: '#ffffff' },
                                    { name: 'Black', color: '#000000' },
                                    { name: 'Gold', color: '#FFD700' },
                                    { name: 'Light Gray', color: '#d1d1d1' },
                                    { name: 'Silver', color: '#c0c0c0' },
                                    { name: 'Blue', color: '#0073aa' },
                                    { name: 'Red', color: '#dc3232' }
                                ]
                            })
                        ),
                        // Child items
                        el('p', { style: { fontWeight: 600, marginBottom: '8px', marginTop: '16px', fontSize: '13px', textTransform: 'uppercase', color: '#757575' } }, __('Child Items')),
                        el(RangeControl, {
                            label: __('Font Size (px)'),
                            value: parseInt(childFontSize, 10) || 18,
                            min: 10,
                            max: 48,
                            step: 1,
                            onChange: function(value) { setAttributes({ childFontSize: String(value) }); }
                        }),
                        el(BaseControl, { label: __('Color') },
                            el(ColorPalette, {
                                value: childColor,
                                onChange: function(color) { setAttributes({ childColor: color || '#d1d1d1' }); },
                                colors: [
                                    { name: 'White', color: '#ffffff' },
                                    { name: 'Black', color: '#000000' },
                                    { name: 'Gold', color: '#FFD700' },
                                    { name: 'Light Gray', color: '#d1d1d1' },
                                    { name: 'Silver', color: '#c0c0c0' },
                                    { name: 'Blue', color: '#0073aa' },
                                    { name: 'Red', color: '#dc3232' }
                                ]
                            })
                        ),
                        // Active/open state
                        el('p', { style: { fontWeight: 600, marginBottom: '8px', marginTop: '16px', fontSize: '13px', textTransform: 'uppercase', color: '#757575' } }, __('Active State')),
                        el(BaseControl, { label: __('Active / Open Color') },
                            el(ColorPalette, {
                                value: activeColor,
                                onChange: function(color) { setAttributes({ activeColor: color || '#FFD700' }); },
                                colors: [
                                    { name: 'White', color: '#ffffff' },
                                    { name: 'Black', color: '#000000' },
                                    { name: 'Gold', color: '#FFD700' },
                                    { name: 'Light Gray', color: '#d1d1d1' },
                                    { name: 'Silver', color: '#c0c0c0' },
                                    { name: 'Blue', color: '#0073aa' },
                                    { name: 'Red', color: '#dc3232' }
                                ]
                            })
                        )
                    ),
                    el(PanelBody, { title: __('Chevron Icon'), initialOpen: false },
                        el('p', { style: { fontSize: '12px', color: '#757575', marginBottom: '12px' } },
                            __('Replaces the default arrow shown next to parent menu items. Rotation animation is preserved.')
                        ),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function(media) {
                                    setAttributes({ chevronIcon: { url: media.url, id: media.id, alt: media.alt || '' } });
                                },
                                allowedTypes: ['image'],
                                value: chevronIcon && chevronIcon.id,
                                render: function(obj) {
                                    return el('div', { style: { marginBottom: '12px' } },
                                        chevronIcon && chevronIcon.url ?
                                            el('div', null,
                                                el('img', { src: chevronIcon.url, alt: chevronIcon.alt, style: { maxWidth: '40px', marginBottom: '8px', display: 'block' } }),
                                                el('div', { style: { display: 'flex', gap: '8px' } },
                                                    el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Replace')),
                                                    el(Button, {
                                                        onClick: function() { setAttributes({ chevronIcon: { url: '', id: null, alt: '' } }); },
                                                        variant: 'link', isDestructive: true, isSmall: true
                                                    }, __('Remove'))
                                                )
                                            ) :
                                            el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Upload Icon'))
                                    );
                                }
                            })
                        ),
                        el(RangeControl, {
                            label: __('Icon Size (px)'),
                            value: parseInt(chevronSize, 10) || 20,
                            min: 10,
                            max: 60,
                            step: 1,
                            onChange: function(value) { setAttributes({ chevronSize: String(value) }); }
                        })
                    )
                ),

                isModalOpen && renderModal(),

                el('section', blockProps,
                    el('div', { className: 'container' },
                        el('div', { className: 'menu-outer' },
                            menuItems.length === 0 ?
                                el('div', { style: { padding: '40px', textAlign: 'center', background: '#f0f0f0', borderRadius: '4px' } },
                                    el('p', null, __('No menu items yet. Click "Edit Menu" in the sidebar →'))
                                ) :
                                menuItems.map(function(item) {
                                    const children = getChildren(item);
                                    if (item.type === 'link') {
                                        return el('h3', { key: item.id },
                                            el('a', { href: item.url || '#' }, item.title || __('(No title)'))
                                        );
                                    }
                                    return el('div', { key: item.id },
                                        el('h3', { className: 'sub-menu-heading ' + item.type },
                                            item.type === 'parent-with-url' ?
                                                el('span', null,
                                                    el('a', { href: item.url || '#' },
                                                        el('span', null, item.title || __('(No title)'))
                                                    ),
                                                    el('button', { className: 'menu-toggle-btn', type: 'button' })
                                                ) :
                                                el('span', null, item.title || __('(No title)'))
                                        ),
                                        el('div', { className: 'menu-children' },
                                            el('ul', { className: 'menu-child-list' },
                                                children.map(function(child) {
                                                    return el('li', { key: child.id },
                                                        el('a', { href: child.url || '#' }, child.name || __('(No name)'))
                                                    );
                                                })
                                            )
                                        )
                                    );
                                })
                        )
                    )
                )
            );
        },
        save: function() {
            return null;
        }
    });
})(window.wp);
