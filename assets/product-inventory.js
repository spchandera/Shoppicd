if (!customElements.get('product-inventory')) {
  class ProductInventory extends HTMLElement {
    constructor() {
      super();
      window.initLazyScript(this, this.initLazySection.bind(this));
    }

    initLazySection() {
      this.section = this.closest('.js-product');
      this.inventoryNotice = this.querySelector('.js-inventory-notice');
      this.urgencyMessage = this.querySelector('.js-inventory-urgency');

      // Bind to on:variant:change event for this product
      this.section.addEventListener('on:variant:change', this.handleVariantChange.bind(this));

      // Init
      this.updateInventory(
        Number.parseInt(this.dataset.inventoryQuantity, 10),
        this.dataset.variantAvailable === 'true',
        this.dataset.inventoryPolicy
      );
    }

    /**
     * Gets the inventory data for all product variants
     * @returns {?object}
     */
    getVariantInventory() {
      const dataEl = this.closest('.product-info').querySelector('.js-inventory-data');
      return JSON.parse(dataEl.textContent);
    }

    /**
     * Handles a 'change' event on the variant picker element
     * @param {object} evt - Event object
     */
    handleVariantChange(evt) {
      if (evt.detail.variant) {
        const inventory = this.getVariantInventory();
        this.updateInventory(
          inventory.inventory_quantity,
          inventory.available,
          inventory.inventory_policy
        );
      } else {
        this.updateInventory(0, false);
        this.hidden = true;
      }
    }

    /**
     *
     * Updates the inventory notice
     * @param {number} count - the inventory quantity available
     * @param {boolean} available - whether current variant is available
     * @param {string} inventoryPolicy - whether product continues selling when out of stock
     */
    updateInventory(count, available, inventoryPolicy) {
      const inventoryLevel = this.determineInventoryLevel(count, available, inventoryPolicy);

      const showNotice = (this.dataset.showNotice === 'always'
        || (this.dataset.showNotice === 'low' && inventoryLevel.includes('low')))
        && !(inventoryLevel === 'backordered' && this.dataset.showNoStockBackordered === 'false');

      if (!showNotice) {
        this.hidden = true;
        return;
      }

      this.hidden = false;
      this.dataset.inventoryLevel = inventoryLevel;
      this.setInventoryNotice(inventoryLevel, count);
      this.setUrgencyMessage(inventoryLevel);
    }

    /**
     * Maps a stock count to an inventory level keyword.
     * @param {number} count - Inventory count.
     * @param {boolean} available - Whether the variant is available.
     * @param {string} inventoryPolicy - Shopify inventory policy.
     * @returns {string} The inventory level keyword.
     */
    determineInventoryLevel(count, available, inventoryPolicy) {
      if (count <= 0) {
        if (inventoryPolicy === 'continue') return 'backordered';
        return available ? 'in_stock' : 'none';
      }
      if (count <= Number.parseInt(this.dataset.thresholdVeryLow, 10)) return 'very_low';
      if (count <= Number.parseInt(this.dataset.thresholdLow, 10)) return 'low';
      return 'normal';
    }

    /**
     * Sets the inventory notice text for the given level.
     * @param {string} inventoryLevel - Inventory level keyword.
     * @param {number} count - Inventory count.
     */
    setInventoryNotice(inventoryLevel, count) {
      const showCount = this.dataset.showCount === 'always'
        || (this.dataset.showCount === 'low' && inventoryLevel.includes('low'));

      if (inventoryLevel === 'backordered') {
        this.inventoryNotice.innerText = theme.strings.backordered;
      } else if (inventoryLevel !== 'in_stock' && showCount) {
        this.inventoryNotice.innerText = theme.strings.onlyXLeft.replace('[quantity]', count);
      } else if (inventoryLevel === 'very_low') {
        this.inventoryNotice.innerText = theme.strings.veryLowStock;
      } else if (inventoryLevel === 'low') {
        this.inventoryNotice.innerText = theme.strings.lowStock;
      } else if (inventoryLevel === 'normal' || inventoryLevel === 'in_stock') {
        this.inventoryNotice.innerText = theme.strings.inStock;
      } else if (inventoryLevel === 'none') {
        this.inventoryNotice.innerText = theme.strings.noStock;
      }
    }

    /**
     * Sets the urgency message HTML for the given level, if present.
     * @param {string} inventoryLevel - Inventory level keyword.
     */
    setUrgencyMessage(inventoryLevel) {
      if (!this.urgencyMessage) return;

      const messages = {
        very_low: this.dataset.textVeryLow,
        low: this.dataset.textLow,
        backordered: this.dataset.textNoStockBackordered,
        normal: this.dataset.textNormal,
        in_stock: this.dataset.textNormal,
        none: this.dataset.textNoStock
      };

      if (inventoryLevel in messages) {
        this.urgencyMessage.innerHTML = messages[inventoryLevel];
      }
    }
  }

  customElements.define('product-inventory', ProductInventory);
}
