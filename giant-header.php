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
