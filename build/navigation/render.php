<?php
$menu_items = isset($attributes['menuItems']) ? $attributes['menuItems'] : [];
$parent_font_size = isset($attributes['parentFontSize']) ? $attributes['parentFontSize'] : '28';
$child_font_size = isset($attributes['childFontSize']) ? $attributes['childFontSize'] : '18';
$parent_color = isset($attributes['parentColor']) ? $attributes['parentColor'] : '#ffffff';
$child_color = isset($attributes['childColor']) ? $attributes['childColor'] : '#d1d1d1';
$active_color = isset($attributes['activeColor']) ? $attributes['activeColor'] : '#FFD700';
$chevron_icon = isset($attributes['chevronIcon']) ? $attributes['chevronIcon'] : ['url' => ''];
$chevron_url = isset($chevron_icon['url']) ? $chevron_icon['url'] : '';
$chevron_size = isset($attributes['chevronSize']) ? $attributes['chevronSize'] : '20';
$nav_style = '--parent-font-size: ' . esc_attr($parent_font_size) . 'px; --child-font-size: ' . esc_attr($child_font_size) . 'px; --parent-color: ' . esc_attr($parent_color) . '; --child-color: ' . esc_attr($child_color) . '; --active-color: ' . esc_attr($active_color) . '; --chevron-size: ' . esc_attr($chevron_size) . 'px;';
if ($chevron_url) {
    $nav_style .= " --chevron-url: url('" . esc_url($chevron_url) . "');";
}
?>
<section <?php echo get_block_wrapper_attributes(['class' => 'nav-outer', 'style' => $nav_style]); ?>>
    <div class="container">
        <div class="menu-outer">
            <?php if (!empty($menu_items)): ?>
                <?php foreach ($menu_items as $item): ?>
                    <?php if ($item['type'] === 'link'): ?>
                        <h3>
                            <a href="<?php echo esc_url($item['url']); ?>">
                                <?php echo esc_html($item['title']); ?>
                            </a>
                        </h3>
                    <?php else: ?>
                        <?php if (!empty($item['subMenus'])): ?>
                            <?php foreach ($item['subMenus'] as $subMenu): ?>
                                <div>
                                    <h3 class="sub-menu-heading <?php echo esc_attr($item['type']); ?>">
                                        <?php if ($item['type'] === 'parent-with-url'): ?>
                                            <a href="<?php echo esc_url($item['url']); ?>">
                                                <span><?php echo esc_html($item['title']); ?></span>
                                            </a>
                                            <button class="menu-toggle-btn" type="button" aria-label="Toggle submenu"></button>
                                        <?php else: ?>
                                            <span><?php echo esc_html($item['title']); ?></span>
                                        <?php endif; ?>
                                    </h3>
                                    <div class="menu-children">
                                        <ul class="menu-child-list">
                                            <?php if (!empty($subMenu['childItems'])): ?>
                                                <?php foreach ($subMenu['childItems'] as $child): ?>
                                                    <li>
                                                        <a href="<?php echo esc_url($child['url']); ?>">
                                                            <?php echo esc_html($child['name']); ?>
                                                        </a>
                                                    </li>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </ul>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    <?php endif; ?>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</section>
