<?php
/**
 * Plugin Name: YZA — Email Control
 * Description: The customer's order confirmation is the branded YZA email sent by
 *              order.php (French, product thumbnails, YZA-xxxx number). This silences
 *              WooCommerce's own default customer order emails so buyers don't get a
 *              second, plain, English "#17" copy. Admin/shop emails (new order to
 *              Nawal, failed/cancelled), refund emails, and manual customer notes stay ON.
 *              Reversible: delete this file to restore WooCommerce's default emails.
 * Author: YZA
 * Version: 1.0
 */
if (!defined('ABSPATH')) { exit; }

/* Disable the customer-facing WooCommerce order emails that duplicate the branded
   YZA confirmation. These filters are the documented WooCommerce switch per email id. */
add_filter('woocommerce_email_enabled_customer_on_hold_order',    '__return_false');
add_filter('woocommerce_email_enabled_customer_processing_order', '__return_false');
add_filter('woocommerce_email_enabled_customer_completed_order',  '__return_false');
add_filter('woocommerce_email_enabled_customer_invoice',          '__return_false');

/* Intentionally left ON (defaults): new_order (admin → Nawal), failed_order,
   cancelled_order, customer_refunded_order, customer_note, customer_new_account. */
