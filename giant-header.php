<?php
/**
 * Plugin Name: Giant Header
 * Description: Site header and navigation blocks
 * Version: 1.0.0
 * Author:      Marius C.
 * Author URI:
 * Text Domain: giant-label
 * License:     GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: giant-header
 */

if (!defined('ABSPATH')) exit;

function giant_header_register_blocks() {
    register_block_type(__DIR__ . '/build/header');
    register_block_type(__DIR__ . '/build/navigation');
}
add_action('init', 'giant_header_register_blocks');

function giant_header_frontend() {
    if (!is_admin()) {
        wp_enqueue_script('giant-header-js', plugin_dir_url(__FILE__) . 'build/frontend.js', [], '1.0', true);
    }
}
add_action('wp_enqueue_scripts', 'giant_header_frontend');

// ── Per-page header overlay meta ─────────────────────────────────────────────

function giant_header_register_meta() {
    $args = [
        'type'              => 'string',
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => function() { return current_user_can('edit_posts'); },
    ];
    register_post_meta('', '_header_overlay_color',   $args);
    register_post_meta('', '_header_overlay_mode',    $args);
    register_post_meta('', '_header_overlay_opacity', $args);
}
add_action('init', 'giant_header_register_meta');

function giant_header_meta_box() {
    $screens = get_post_types(['public' => true]);
    foreach ($screens as $screen) {
        add_meta_box(
            'giant_header_overlay',
            'Header Overlay',
            'giant_header_meta_box_html',
            $screen,
            'side',
            'default'
        );
    }
}
add_action('add_meta_boxes', 'giant_header_meta_box');

function giant_header_palette() {
    return [
        ['name' => 'Black',       'color' => '#000000'],
        ['name' => 'White',       'color' => '#ffffff'],
        ['name' => 'Dark Grey',   'color' => '#1a1a1a'],
        ['name' => 'Mid Grey',    'color' => '#6b7280'],
        ['name' => 'Light Grey',  'color' => '#e5e7eb'],
        ['name' => 'Navy',        'color' => '#0f172a'],
        ['name' => 'Blue',        'color' => '#0082C9'],
        ['name' => 'Sky Blue',    'color' => '#38bdf8'],
        ['name' => 'Teal',        'color' => '#0d9488'],
        ['name' => 'Green',       'color' => '#16a34a'],
        ['name' => 'Gold',        'color' => '#FFD700'],
        ['name' => 'Orange',      'color' => '#f97316'],
        ['name' => 'Red',         'color' => '#dc2626'],
        ['name' => 'Pink',        'color' => '#ec4899'],
        ['name' => 'Purple',      'color' => '#7c3aed'],
    ];
}

function giant_header_meta_box_html($post) {
    $color   = get_post_meta($post->ID, '_header_overlay_color',   true);
    $mode    = get_post_meta($post->ID, '_header_overlay_mode',    true);
    $opacity = get_post_meta($post->ID, '_header_overlay_opacity', true);
    if (!$mode)           $mode    = 'scroll';
    if ($opacity === '')  $opacity = '80';
    $current = $color ?: '#000000';

    wp_nonce_field('giant_header_overlay_nonce', 'giant_header_overlay_nonce');
    $palette = giant_header_palette();
    ?>
    <p style="margin:0 0 8px;">
        <label style="display:block;font-weight:600;margin-bottom:6px;">Overlay colour</label>

        <!-- Palette swatches -->
        <span style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;" id="gh-swatches">
            <?php foreach ($palette as $swatch): ?>
                <?php
                $is_active = strtolower($current) === strtolower($swatch['color']);
                $border    = $is_active ? '3px solid #007cba' : '2px solid #ccc';
                $outline   = $is_active ? 'outline:2px solid #007cba;outline-offset:2px;' : '';
                ?>
                <button
                    type="button"
                    title="<?php echo esc_attr($swatch['name']); ?>"
                    data-color="<?php echo esc_attr($swatch['color']); ?>"
                    class="gh-swatch<?php echo $is_active ? ' gh-swatch-active' : ''; ?>"
                    style="width:28px;height:28px;border-radius:50%;background:<?php echo esc_attr($swatch['color']); ?>;border:<?php echo $border; ?>;<?php echo $outline; ?>cursor:pointer;padding:0;flex-shrink:0;"
                ></button>
            <?php endforeach; ?>
        </span>

        <!-- Custom colour picker -->
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input
                type="color"
                id="gh-custom-picker"
                value="<?php echo esc_attr($current); ?>"
                style="width:36px;height:36px;padding:2px;border:2px solid #ccc;border-radius:6px;cursor:pointer;flex-shrink:0;"
            >
            <span style="font-size:12px;color:#555;">Custom colour</span>
        </label>

        <!-- Hidden field that actually gets submitted -->
        <input type="hidden" name="header_overlay_color" id="gh-color-value" value="<?php echo esc_attr($current); ?>">

        <span style="display:block;font-size:11px;color:#757575;margin-top:6px;">
            Selected: <strong id="gh-color-preview" style="font-family:monospace;"><?php echo esc_html($current); ?></strong>
            &nbsp;<span id="gh-color-dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:<?php echo esc_attr($current); ?>;border:1px solid #ccc;vertical-align:middle;"></span>
        </span>
    </p>

    <p style="margin:0 0 10px;">
        <label style="display:block;font-weight:600;margin-bottom:4px;">Opacity: <span id="gh-opacity-val"><?php echo esc_html($opacity); ?></span>%</label>
        <input type="range" name="header_overlay_opacity" id="gh-opacity-range" min="0" max="100" value="<?php echo esc_attr($opacity); ?>" style="width:100%;">
    </p>

    <p style="margin:0;">
        <label style="display:block;font-weight:600;margin-bottom:6px;">Overlay mode</label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;cursor:pointer;">
            <input type="radio" name="header_overlay_mode" value="scroll" <?php checked($mode, 'scroll'); ?>>
            Activate on scroll
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="radio" name="header_overlay_mode" value="always" <?php checked($mode, 'always'); ?>>
            Always show colour
        </label>
    </p>

    <script>
    (function () {
        var hidden  = document.getElementById('gh-color-value');
        var picker  = document.getElementById('gh-custom-picker');
        var preview = document.getElementById('gh-color-preview');
        var dot     = document.getElementById('gh-color-dot');
        var swatches = document.querySelectorAll('.gh-swatch');
        var opacityRange = document.getElementById('gh-opacity-range');
        var opacityVal   = document.getElementById('gh-opacity-val');

        function setColor(hex) {
            hidden.value  = hex;
            picker.value  = hex;
            preview.textContent = hex;
            dot.style.background = hex;
            swatches.forEach(function (s) {
                var active = s.dataset.color.toLowerCase() === hex.toLowerCase();
                s.classList.toggle('gh-swatch-active', active);
                s.style.border  = active ? '3px solid #007cba' : '2px solid #ccc';
                s.style.outline = active ? '2px solid #007cba' : '';
                s.style.outlineOffset = active ? '2px' : '';
            });
        }

        swatches.forEach(function (s) {
            s.addEventListener('click', function () { setColor(s.dataset.color); });
        });

        picker.addEventListener('input', function () { setColor(picker.value); });

        if (opacityRange && opacityVal) {
            opacityRange.addEventListener('input', function () { opacityVal.textContent = opacityRange.value; });
        }
    })();
    </script>
    <?php
}

function giant_header_save_meta($post_id) {
    if (!isset($_POST['giant_header_overlay_nonce'])) return;
    if (!wp_verify_nonce($_POST['giant_header_overlay_nonce'], 'giant_header_overlay_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['header_overlay_color'])) {
        update_post_meta($post_id, '_header_overlay_color', sanitize_text_field($_POST['header_overlay_color']));
    }
    if (isset($_POST['header_overlay_mode'])) {
        $mode = sanitize_text_field($_POST['header_overlay_mode']);
        update_post_meta($post_id, '_header_overlay_mode', in_array($mode, ['scroll', 'always']) ? $mode : 'scroll');
    }
    if (isset($_POST['header_overlay_opacity'])) {
        $opacity = intval($_POST['header_overlay_opacity']);
        $opacity = max(0, min(100, $opacity));
        update_post_meta($post_id, '_header_overlay_opacity', (string) $opacity);
    }
}
add_action('save_post', 'giant_header_save_meta');

function giant_header_inject_overlay_vars() {
    $post_id = get_queried_object_id();
    if (!$post_id) return;

    $color   = get_post_meta($post_id, '_header_overlay_color',   true);
    $mode    = get_post_meta($post_id, '_header_overlay_mode',    true);
    $opacity = get_post_meta($post_id, '_header_overlay_opacity', true);
    if (!$color && !$mode) return;

    $color   = $color ?: '#000000';
    $mode    = in_array($mode, ['scroll', 'always']) ? $mode : 'scroll';
    $opacity = ($opacity !== '') ? max(0, min(100, intval($opacity))) : 80;
    $alpha   = round($opacity / 100, 2);

    // Convert hex to rgb for use in rgba()
    $r = hexdec(substr($color, 1, 2));
    $g = hexdec(substr($color, 3, 2));
    $b = hexdec(substr($color, 5, 2));

    echo '<style id="giant-header-overlay-vars">'
       . ':root{'
       . '--header-overlay-r:' . $r . ';'
       . '--header-overlay-g:' . $g . ';'
       . '--header-overlay-b:' . $b . ';'
       . '--header-overlay-a:' . $alpha . ';'
       . '}'
       . '</style>' . "\n";

    // Pass mode to JS
    echo '<script>window.giantHeaderOverlay={color:"' . esc_js($color) . '",mode:"' . esc_js($mode) . '"};</script>' . "\n";
}
add_action('wp_head', 'giant_header_inject_overlay_vars');
