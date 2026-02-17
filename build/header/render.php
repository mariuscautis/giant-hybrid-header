<?php
$logo = isset($attributes['logo']) ? $attributes['logo'] : ['url' => '', 'alt' => ''];
$logo_url = isset($logo['url']) ? $logo['url'] : '';
$logo_alt = isset($logo['alt']) ? $logo['alt'] : '';
$bg_color = isset($attributes['backgroundColor']) ? $attributes['backgroundColor'] : 'transparent';
$contact_text = isset($attributes['contactText']) ? $attributes['contactText'] : 'Contact us';
$contact_url = isset($attributes['contactUrl']) ? $attributes['contactUrl'] : '#contact';
$contact_display_mode = isset($attributes['contactDisplayMode']) ? $attributes['contactDisplayMode'] : 'label';
$contact_icon = isset($attributes['contactIcon']) ? $attributes['contactIcon'] : ['url' => '', 'alt' => ''];
$contact_icon_url = isset($contact_icon['url']) ? $contact_icon['url'] : '';
$contact_icon_alt = isset($contact_icon['alt']) ? $contact_icon['alt'] : $contact_text;
$contact_icon_width = isset($attributes['contactIconWidth']) ? $attributes['contactIconWidth'] : '32';
$container_width = isset($attributes['containerWidth']) ? $attributes['containerWidth'] : '1200';

// Read parentColor from the inner navigation block so the header can expose it as a CSS var
$nav_parent_color = '#ffffff';
if (isset($block) && $block instanceof WP_Block) {
    foreach ($block->inner_blocks as $inner_block) {
        if ($inner_block->name === 'giant-header/navigation-menu') {
            $nav_parent_color = isset($inner_block->attributes['parentColor']) ? $inner_block->attributes['parentColor'] : '#ffffff';
            break;
        }
    }
}

// Build inline style for header
$header_styles = [];
$header_styles[] = '--parent-color: ' . esc_attr($nav_parent_color);
if ($bg_color && $bg_color !== 'transparent') {
    $header_styles[] = 'background-color: ' . esc_attr($bg_color);
    $header_styles[] = '--menu-bg-color: ' . esc_attr($bg_color);
}
if ($container_width) {
    $header_styles[] = '--container-width: ' . esc_attr($container_width) . 'px';
}
$header_style = !empty($header_styles) ? ' style="' . implode('; ', $header_styles) . ';"' : '';

// Container style
$container_style = $container_width ? ' style="max-width: ' . esc_attr($container_width) . 'px;"' : '';
?>
<header <?php echo get_block_wrapper_attributes(['class' => 'site-header']); ?><?php echo $header_style; ?>>
    <div class="container"<?php echo $container_style; ?>>
        <div class="menu-inner">
            <!-- Contact link - LEFT -->
            <a href="<?php echo esc_url($contact_url); ?>" class="contact-link">
                <?php if ($contact_display_mode === 'icon' && $contact_icon_url): ?>
                    <img src="<?php echo esc_url($contact_icon_url); ?>" alt="<?php echo esc_attr($contact_icon_alt); ?>" class="contact-icon" style="max-width: <?php echo esc_attr($contact_icon_width); ?>px; width: 100%;">
                <?php else: ?>
                    <?php echo esc_html($contact_text); ?>
                <?php endif; ?>
            </a>

            <!-- Logo - CENTER -->
            <?php if ($logo_url): ?>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
                    <img src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($logo_alt); ?>" class="logo-img">
                </a>
            <?php endif; ?>

            <!-- Menu icon - RIGHT -->
            <div class="menu-icon"></div>

            <!-- Mobile menu overlay -->
            <nav class="wp-block-navigation main-menu">
                <?php echo $content; ?>
            </nav>

            <div class="close-icon"></div>
        </div>
    </div>
</header>
