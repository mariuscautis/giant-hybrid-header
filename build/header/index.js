(function(wp) {
    const { registerBlockType } = wp.blocks;
    const { useBlockProps, MediaUpload, MediaUploadCheck, InnerBlocks, InspectorControls, ColorPalette } = wp.blockEditor;
    const { Button, PanelBody, Placeholder, TextControl, BaseControl, ToggleControl } = wp.components;
    const { __ } = wp.i18n;
    const { createElement: el, Fragment } = wp.element;

    registerBlockType('giant-header/header', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { logo, backgroundColor, contactText, contactUrl, contactDisplayMode, contactIcon, contactIconWidth, containerWidth } = attributes;
            
            const inlineStyle = {};
            if (backgroundColor) {
                inlineStyle.backgroundColor = backgroundColor;
                inlineStyle['--menu-bg-color'] = backgroundColor;
            }
            if (containerWidth) {
                inlineStyle['--container-width'] = containerWidth + 'px';
            }
            
            const blockProps = useBlockProps({ 
                className: 'site-header',
                style: inlineStyle
            });

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
                                                el('img', { src: logo.url, alt: logo.alt, style: { maxWidth: '200px', marginBottom: '10px', display: 'block' } }),
                                                el('div', null,
                                                    el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Replace')),
                                                    el(Button, {
                                                        onClick: function() { setAttributes({ logo: { url: '', id: null, alt: '' } }); },
                                                        variant: 'link',
                                                        isDestructive: true,
                                                        isSmall: true
                                                    }, __('Remove'))
                                                )
                                            ) :
                                            el(Button, { onClick: obj.open, variant: 'secondary' }, __('Upload Logo'))
                                    );
                                }
                            })
                        ),
                        
                        // Background color picker
                        el(BaseControl, {
                            label: __('Background Color'),
                            help: __('Choose a background color or transparent')
                        },
                            el(ColorPalette, {
                                value: backgroundColor,
                                onChange: function(color) { 
                                    setAttributes({ backgroundColor: color || 'transparent' });
                                },
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
                            help: __('Maximum width of the header content and menu overlay (default: 1200)')
                        }),
                        
                        // Contact area
                        el('div', { style: { borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '4px' } },
                            el('p', { style: { fontWeight: 600, marginBottom: '12px' } }, __('Contact Area')),
                            // URL — always visible
                            el(TextControl, {
                                label: __('URL'),
                                value: contactUrl,
                                onChange: function(value) { setAttributes({ contactUrl: value }); },
                                placeholder: '#contact'
                            }),
                            // Toggle: label vs icon
                            el(ToggleControl, {
                                label: __('Use Icon Instead of Label'),
                                checked: contactDisplayMode === 'icon',
                                onChange: function(checked) {
                                    setAttributes({ contactDisplayMode: checked ? 'icon' : 'label' });
                                }
                            }),
                            // Label fields (shown when mode = label)
                            contactDisplayMode !== 'icon' && el(TextControl, {
                                label: __('Label Text'),
                                value: contactText,
                                onChange: function(value) { setAttributes({ contactText: value }); },
                                placeholder: 'Contact us'
                            }),
                            // Icon upload (shown when mode = icon)
                            contactDisplayMode === 'icon' && el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function(media) {
                                        setAttributes({ contactIcon: { url: media.url, id: media.id, alt: media.alt || '' } });
                                    },
                                    allowedTypes: ['image'],
                                    value: contactIcon.id,
                                    render: function(obj) {
                                        return el('div', null,
                                            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: 600 } }, __('Icon')),
                                            contactIcon.url ?
                                                el('div', null,
                                                    el('img', { src: contactIcon.url, alt: contactIcon.alt, style: { maxWidth: '48px', marginBottom: '8px', display: 'block' } }),
                                                    el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } },
                                                        el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Replace')),
                                                        el(Button, {
                                                            onClick: function() { setAttributes({ contactIcon: { url: '', id: null, alt: '' } }); },
                                                            variant: 'link', isDestructive: true, isSmall: true
                                                        }, __('Remove'))
                                                    ),
                                                    el(TextControl, {
                                                        label: __('Max Width (px)'),
                                                        value: contactIconWidth,
                                                        type: 'number',
                                                        onChange: function(value) { setAttributes({ contactIconWidth: value }); }
                                                    })
                                                ) :
                                                el(Button, { onClick: obj.open, variant: 'secondary', isSmall: true }, __('Upload Icon'))
                                        );
                                    }
                                })
                            )
                        )
                    )
                ),
                el('header', blockProps,
                    el('div', { 
                        className: 'container',
                        style: { maxWidth: containerWidth ? containerWidth + 'px' : '1200px' }
                    },
                        el('div', { className: 'menu-inner' },
                            // Contact link - LEFT
                            el('a', { href: contactUrl || '#contact', className: 'contact-link' },
                                contactDisplayMode === 'icon' && contactIcon.url ?
                                    el('img', { src: contactIcon.url, alt: contactIcon.alt || contactText, style: { maxWidth: (contactIconWidth || '32') + 'px', width: '100%', display: 'block' } }) :
                                    (contactText || 'Contact us')
                            ),
                            
                            // Logo - CENTER
                            logo.url && el('a', { href: '/', className: 'logo' },
                                el('img', { src: logo.url, alt: logo.alt, className: 'logo-img' })
                            ),
                            
                            // Menu icon - RIGHT
                            el('div', { className: 'menu-icon' }),
                            
                            // Navigation menu
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
