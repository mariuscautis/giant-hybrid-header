<?php
$logo = isset($attributes['logo']) ? $attributes['logo'] : ['url' => '', 'alt' => ''];
$logo_url = isset($logo['url']) ? $logo['url'] : '';
$logo_alt = isset($logo['alt']) ? $logo['alt'] : '';
$logo_width = isset($attributes['logoWidth']) ? $attributes['logoWidth'] : '160';
$bg_color = isset($attributes['backgroundColor']) ? $attributes['backgroundColor'] : 'transparent';
$container_width = isset($attributes['containerWidth']) ? $attributes['containerWidth'] : '1200';
$inline_nav_items = isset($attributes['inlineNavItems']) ? $attributes['inlineNavItems'] : [];

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
if ($logo_width) {
    $header_styles[] = '--logo-width: ' . esc_attr($logo_width) . 'px';
}
$header_style = !empty($header_styles) ? ' style="' . implode('; ', $header_styles) . ';"' : '';

$container_style = $container_width ? ' style="max-width: ' . esc_attr($container_width) . 'px;"' : '';
?>
<header <?php echo get_block_wrapper_attributes(['class' => 'site-header']); ?><?php echo $header_style; ?>>
    <div class="container"<?php echo $container_style; ?>>
        <div class="menu-inner">
            <!-- Logo - LEFT -->
            <?php if ($logo_url): ?>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
                    <img src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($logo_alt); ?>" class="logo-img" style="width: <?php echo esc_attr($logo_width); ?>px;">
                </a>
            <?php endif; ?>

            <!-- Inline desktop nav - CENTER-RIGHT -->
            <?php if (!empty($inline_nav_items)): ?>
                <nav class="inline-nav">
                    <?php foreach ($inline_nav_items as $item): ?>
                        <?php
                        $has_children = !empty($item['children']);
                        $item_url = isset($item['url']) ? $item['url'] : '';
                        $item_label = isset($item['label']) ? $item['label'] : '';
                        $item_new_tab = !empty($item['newTab']);
                        ?>
                        <div class="inline-nav-item<?php echo $has_children ? ' has-dropdown' : ''; ?>">
                            <?php if ($item_url && !$has_children): ?>
                                <a href="<?php echo esc_url($item_url); ?>" class="inline-nav-label"<?php if ($item_new_tab): ?> target="_blank" rel="noopener noreferrer"<?php endif; ?>><?php echo esc_html($item_label); ?></a>
                            <?php else: ?>
                                <button type="button" class="inline-nav-label">
                                    <?php echo esc_html($item_label); ?>
                                    <?php if ($has_children): ?>
                                        <img class="inline-nav-chevron" src="<?php echo esc_url(plugins_url('assets/chevron.svg', dirname(dirname(__DIR__)) . '/giant-header.php')); ?>" alt="" width="12" height="12" aria-hidden="true">
                                    <?php endif; ?>
                                </button>
                            <?php endif; ?>
                            <?php if ($has_children): ?>
                                <div class="inline-nav-dropdown">
                                    <?php foreach ($item['children'] as $child): ?>
                                        <?php $child_new_tab = !empty($child['newTab']); ?>
                                        <a href="<?php echo esc_url(isset($child['url']) ? $child['url'] : '#'); ?>" class="inline-nav-dropdown-item"<?php if ($child_new_tab): ?> target="_blank" rel="noopener noreferrer"<?php endif; ?>>
                                            <?php echo esc_html(isset($child['label']) ? $child['label'] : ''); ?>
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </nav>
            <?php endif; ?>

            <!-- Burger menu icon - RIGHT -->
            <div class="menu-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <!-- Mobile menu overlay -->
            <nav class="wp-block-navigation main-menu">
                <?php echo $content; ?>
            </nav>

            <!-- Close icon — inline SVG inherits --parent-color via currentColor -->
            <div class="close-icon" role="button" aria-label="Close menu">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="4" x2="20" y2="20"/>
                    <line x1="20" y1="4" x2="4" y2="20"/>
                </svg>
            </div>
        </div>
    </div>
</header>
