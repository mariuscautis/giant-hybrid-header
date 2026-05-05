(function(wp) {
    const { registerBlockType } = wp.blocks;
    const { useBlockProps, MediaUpload, MediaUploadCheck, InnerBlocks, InspectorControls, ColorPalette } = wp.blockEditor;
    const { Button, PanelBody, TextControl, BaseControl, Modal, CheckboxControl } = wp.components;
    const { __ } = wp.i18n;
    const { createElement: el, Fragment, useState, useRef } = wp.element;

    registerBlockType('giant-header/header', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { logo, logoWidth, backgroundColor, containerWidth, inlineNavItems } = attributes;
            const [isNavModalOpen, setIsNavModalOpen] = useState(false);

            const inlineStyle = {};
            if (backgroundColor) {
                inlineStyle.backgroundColor = backgroundColor;
                inlineStyle['--menu-bg-color'] = backgroundColor;
            }
            if (containerWidth) inlineStyle['--container-width'] = containerWidth + 'px';
            if (logoWidth) inlineStyle['--logo-width'] = logoWidth + 'px';

            const blockProps = useBlockProps({
                className: 'site-header',
                style: inlineStyle
            });

            // ── Inline nav helpers ─────────────────────────────────────────

            const addNavItem = function() {
                setAttributes({ inlineNavItems: [...inlineNavItems, { id: Date.now(), label: '', url: '', newTab: false, children: [] }] });
            };

            const updateNavItem = function(index, field, value) {
                const updated = inlineNavItems.map(function(item, i) {
                    return i === index ? Object.assign({}, item, { [field]: value }) : item;
                });
                setAttributes({ inlineNavItems: updated });
            };

            const removeNavItem = function(index) {
                setAttributes({ inlineNavItems: inlineNavItems.filter(function(_, i) { return i !== index; }) });
            };

            const addNavChild = function(itemIndex) {
                const updated = inlineNavItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    return Object.assign({}, item, { children: [...(item.children || []), { id: Date.now(), label: '', url: '', newTab: false }] });
                });
                setAttributes({ inlineNavItems: updated });
            };

            const updateNavChild = function(itemIndex, childIndex, field, value) {
                const updated = inlineNavItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const children = (item.children || []).map(function(child, ci) {
                        return ci === childIndex ? Object.assign({}, child, { [field]: value }) : child;
                    });
                    return Object.assign({}, item, { children: children });
                });
                setAttributes({ inlineNavItems: updated });
            };

            const removeNavChild = function(itemIndex, childIndex) {
                const updated = inlineNavItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    return Object.assign({}, item, { children: (item.children || []).filter(function(_, ci) { return ci !== childIndex; }) });
                });
                setAttributes({ inlineNavItems: updated });
            };

            const reorderNavChild = function(itemIndex, fromIndex, toIndex) {
                if (fromIndex === toIndex) return;
                const updated = inlineNavItems.map(function(item, i) {
                    if (i !== itemIndex) return item;
                    const children = [...(item.children || [])];
                    const moved = children.splice(fromIndex, 1)[0];
                    children.splice(toIndex, 0, moved);
                    return Object.assign({}, item, { children: children });
                });
                setAttributes({ inlineNavItems: updated });
            };

            const navDragRef = useRef(null);

            // ── Nav modal ──────────────────────────────────────────────────

            const renderNavModal = function() {
                return el(Modal, {
                    title: __('Desktop Nav Items'),
                    onRequestClose: function() { setIsNavModalOpen(false); },
                    className: 'giant-header-nav-modal'
                },
                    el('div', { style: { minWidth: '560px' } },
                        el('div', { style: { maxHeight: '60vh', overflowY: 'auto', paddingRight: '2px' } },
                            inlineNavItems.length === 0 ?
                                el('p', { style: { color: '#999', textAlign: 'center', padding: '30px 0' } }, __('No items yet. Click "+ Add Item" below.')) :
                                inlineNavItems.map(function(item, itemIndex) {
                                    const children = item.children || [];
                                    return el('div', {
                                        key: item.id || itemIndex,
                                        style: { background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '12px' }
                                    },
                                        // Top row: label + url + new tab + remove
                                        el('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '8px' } },
                                            el(TextControl, {
                                                label: __('Label'),
                                                value: item.label,
                                                onChange: function(v) { updateNavItem(itemIndex, 'label', v); },
                                                placeholder: __('e.g. Services'),
                                                style: { flex: 1 }
                                            }),
                                            el(TextControl, {
                                                label: __('URL (optional)'),
                                                value: item.url,
                                                onChange: function(v) { updateNavItem(itemIndex, 'url', v); },
                                                placeholder: 'https://',
                                                style: { flex: 1 }
                                            }),
                                            el(Button, { isDestructive: true, isSmall: true, variant: 'tertiary',
                                                onClick: function() { removeNavItem(itemIndex); }
                                            }, __('✕ Remove'))
                                        ),
                                        el(CheckboxControl, {
                                            label: __('Open in new tab'),
                                            checked: !!item.newTab,
                                            onChange: function(v) { updateNavItem(itemIndex, 'newTab', v); },
                                            style: { marginBottom: '12px' }
                                        }),
                                        // Children
                                        el('div', { style: { background: '#f8f9fa', border: '1px solid #e4e6ea', borderRadius: '6px', padding: '12px' } },
                                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: children.length ? '10px' : '0' } },
                                                el('span', { style: { fontWeight: 600, fontSize: '12px', color: '#555', textTransform: 'uppercase' } },
                                                    __('Dropdown Items') + (children.length ? ' (' + children.length + ')' : '')
                                                ),
                                                el(Button, { variant: 'secondary', isSmall: true, onClick: function() { addNavChild(itemIndex); } }, __('+ Add'))
                                            ),
                                            children.map(function(child, childIndex) {
                                                return el('div', {
                                                    key: child.id || childIndex,
                                                    style: { display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto auto', gap: '8px', alignItems: 'flex-end', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '8px 10px', border: '1px solid #e0e0e0', transition: 'opacity 0.15s' },
                                                    draggable: true,
                                                    onDragStart: function(e) {
                                                        navDragRef.current = { itemIndex: itemIndex, fromIndex: childIndex };
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
                                                        var drag = navDragRef.current;
                                                        if (drag && drag.itemIndex === itemIndex) {
                                                            reorderNavChild(itemIndex, drag.fromIndex, childIndex);
                                                        }
                                                        navDragRef.current = null;
                                                    }
                                                },
                                                    el('div', { style: { alignSelf: 'flex-end', paddingBottom: '8px', cursor: 'grab', color: '#aaa', fontSize: '16px', lineHeight: 1, userSelect: 'none' }, title: __('Drag to reorder') }, '⠿'),
                                                    el(TextControl, {
                                                        label: __('Label'),
                                                        value: child.label,
                                                        onChange: function(v) { updateNavChild(itemIndex, childIndex, 'label', v); },
                                                        placeholder: __('Link text')
                                                    }),
                                                    el(TextControl, {
                                                        label: __('URL'),
                                                        value: child.url,
                                                        onChange: function(v) { updateNavChild(itemIndex, childIndex, 'url', v); },
                                                        placeholder: 'https://'
                                                    }),
                                                    el('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4px' } },
                                                        el(CheckboxControl, {
                                                            label: __('New tab'),
                                                            checked: !!child.newTab,
                                                            onChange: function(v) { updateNavChild(itemIndex, childIndex, 'newTab', v); }
                                                        })
                                                    ),
                                                    el(Button, { isDestructive: true, isSmall: true, variant: 'tertiary',
                                                        onClick: function() { removeNavChild(itemIndex, childIndex); },
                                                        style: { alignSelf: 'flex-end', marginBottom: '2px' }
                                                    }, '✕')
                                                );
                                            })
                                        )
                                    );
                                })
                        ),
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', paddingTop: '14px', marginTop: '10px', borderTop: '1px solid #e0e0e0' } },
                            el(Button, { variant: 'primary', onClick: addNavItem }, __('+ Add Item')),
                            el(Button, { variant: 'secondary', onClick: function() { setIsNavModalOpen(false); } }, __('Done'))
                        )
                    )
                );
            };

            // ── Preview inline nav in editor ───────────────────────────────

            const renderEditorInlineNav = function() {
                if (!inlineNavItems || inlineNavItems.length === 0) return null;
                return el('nav', { className: 'inline-nav', style: { display: 'flex', alignItems: 'center', gap: '28px' } },
                    inlineNavItems.map(function(item, i) {
                        const hasChildren = item.children && item.children.length > 0;
                        return el('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--parent-color,#fff)', fontSize: '15px', fontWeight: 500, cursor: 'default' } },
                            el('span', null, item.label || __('(Label)')),
                            hasChildren && el('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '12', height: '12', viewBox: '0 0 24 24', fill: 'none', stroke: '#0082C9', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0 } },
                                el('polyline', { points: '6 9 12 15 18 9' })
                            )
                        );
                    })
                );
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Header Settings'), initialOpen: true },
                        // Logo upload
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function(media) {
                                    setAttributes({ logo: { url: media.url, id: media.id, alt: media.alt || '' } });
                                },
                                allowedTypes: ['image'],
                                value: logo.id,
                                render: function(obj) {
                                    return el('div', { style: { marginBottom: '20px' } },
                                        el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 600 } }, __('Logo')),
                                        logo.url ?
                                            el('div', null,
                                                el('img', { src: logo.url, alt: logo.alt, style: { maxWidth: '160px', marginBottom: '10px', display: 'block' } }),
                                                el('div', null,
                                                    el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Replace')),
                                                    el(Button, {
                                                        onClick: function() { setAttributes({ logo: { url: '', id: null, alt: '' } }); },
                                                        variant: 'link', isDestructive: true, isSmall: true
                                                    }, __('Remove'))
                                                )
                                            ) :
                                            el(Button, { onClick: obj.open, variant: 'secondary' }, __('Upload Logo'))
                                    );
                                }
                            })
                        ),

                        // Logo width
                        el(TextControl, {
                            label: __('Logo Width (px)'),
                            value: logoWidth,
                            onChange: function(value) { setAttributes({ logoWidth: value }); },
                            type: 'number',
                            help: __('Display width of the logo image (default: 160)')
                        }),

                        // Background color
                        el(BaseControl, { label: __('Background Color'), help: __('Choose a background color or transparent') },
                            el(ColorPalette, {
                                value: backgroundColor,
                                onChange: function(color) { setAttributes({ backgroundColor: color || 'transparent' }); },
                                clearable: true,
                                colors: [
                                    { name: 'Transparent', color: 'transparent' },
                                    { name: 'White', color: '#ffffff' },
                                    { name: 'Black', color: '#000000' },
                                    { name: 'Dark Gray', color: '#333333' },
                                    { name: 'Light Gray', color: '#f5f5f5' },
                                    { name: 'Blue', color: '#0073aa' },
                                    { name: 'Red', color: '#dc3232' },
                                    { name: 'Green', color: '#46b450' }
                                ]
                            })
                        ),

                        // Container width
                        el(TextControl, {
                            label: __('Container Max Width (px)'),
                            value: containerWidth,
                            onChange: function(value) { setAttributes({ containerWidth: value }); },
                            type: 'number',
                            help: __('Maximum width of the header content (default: 1200)')
                        })
                    ),

                    el(PanelBody, { title: __('Desktop Nav Items'), initialOpen: false },
                        el('p', { style: { color: '#666', fontSize: '13px', marginBottom: '12px' } },
                            inlineNavItems.length === 0
                                ? __('No desktop nav items configured.')
                                : inlineNavItems.length + ' item' + (inlineNavItems.length !== 1 ? 's' : '') + ' configured'
                        ),
                        el(Button, {
                            variant: 'primary',
                            onClick: function() { setIsNavModalOpen(true); },
                            style: { width: '100%', justifyContent: 'center' }
                        }, __('✏ Edit Desktop Nav'))
                    )
                ),

                isNavModalOpen && renderNavModal(),

                el('header', blockProps,
                    el('div', {
                        className: 'container',
                        style: { maxWidth: containerWidth ? containerWidth + 'px' : '1200px' }
                    },
                        el('div', { className: 'menu-inner' },
                            // Logo - LEFT
                            logo.url && el('a', { href: '/', className: 'logo' },
                                el('img', { src: logo.url, alt: logo.alt, className: 'logo-img', style: { width: (logoWidth || '160') + 'px' } })
                            ),

                            // Inline desktop nav preview
                            renderEditorInlineNav(),

                            // Burger icon
                            el('div', { className: 'menu-icon' },
                                el('span'),
                                el('span'),
                                el('span')
                            ),

                            // Full-screen nav
                            el('nav', { className: 'wp-block-navigation main-menu' },
                                el(InnerBlocks, {
                                    allowedBlocks: ['giant-header/navigation-menu'],
                                    template: [['giant-header/navigation-menu', {}]],
                                    templateLock: false
                                })
                            ),

                            el('div', { className: 'close-icon' })
                        )
                    )
                )
            );
        },
        save: function() {
            return el(InnerBlocks.Content);
        }
    });
})(window.wp);
