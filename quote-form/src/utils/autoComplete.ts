/**
 * DataItem - used for geographyData in preloaded data for each specific residence, citizenship, or destination.
 * @param code - code for destination, citizenship or residence (ex: USA)
 * @param value - full name for destination, citizenship or residence (ex: United States) 
 * @param alias
 * @param lemma - full name for destination, citizenship or residence (ex: United States) 
 */
export interface DataItem {
  code: string;
  value: string;
  alias?: string;
  lemma?: string;
}

interface FilterOptions {
  defaultEntryOnNone?: string | null;
  includeCode?: boolean;
}

// Forced mappings for user input to specific codes
const forcedMappings = {
  mexico: 'OT',
};

/**
 * Utility class for AutoComplete filtering
 */
export default class AutoCompleteFilter {
  private data: DataItem[];
  private query: string;
  private results: DataItem[];

  /**
   * @param {Object[]} data Main dataset to be filtered
   * @param {String} data[].code (required)
   * @param {String} data[].value (required)
   * @param {String} data[].alias
   * @param {String} data[].lemma
   */
  constructor(data: DataItem[]) {
    this.data = data;
    this.query = '';
    this.results = [];
  }


/**
  * Gets the current result set
  *
  * @return {DataItem[]} Results
  */
  get suggestions(): DataItem[] {
    return this.results;
  }

  /**
   * Sets the query to filter results by
   *
   * @param {String} query Query to filter results by
   * @return {this}
   */
  setQuery(query: string): this {
    this.query = query.trim();
    return this;
  }


  /**
   * Clear the result set
   *
   * @return {this}
   */
  clearResults(): this {
    this.results = [];
    return this;
  }


  /**
   * Filters dataset based on query
   *
   * Supported Options:
   *   'defaultEntryOnNone' - The 'code' of the data set entry to use as a default when no suggestions are found.
   *
   * @param {Object} options An object containing filtering options
   *
   * @return {this}
   */
  filterSuggestions(options: FilterOptions = {}): this {
    const { defaultEntryOnNone = null, includeCode = false } = options;
    const returnCodes: string[] = [];
    const queryLength = this.query.split(' ').length;

    // If there is no query, nothing more to do. Return
    // the current state, which will always return
    // the latest results
    if (!this.query) return this;

    const filteredData = this.data.length > 0 ? this.data.filter(item => {

      if (item.value.toLowerCase() === 'other') return false;

      const words = item.value.split(' ');

      // Check for forced mappings inside the filter
      for (const [keyword, forcedCode] of Object.entries(forcedMappings)) {
        if (
          keyword.startsWith(this.query.toLowerCase()) &&
          item.code === forcedCode &&
          !returnCodes.includes(item.code)
        ) {
          returnCodes.push(item.code);
          return true;
        }
      }

      // If we already found a match for this entries `code` property,
      // move it along, no need for more than one entry
      if (returnCodes.includes(item.code)) return false;

      if (includeCode && this.query.toLowerCase() === item.code.toLowerCase())
        return true;


      // Loop through each of the words in the phrase
      /* eslint no-restricted-syntax: 0 */
      for (const [index, word] of words.entries()) {
        let searchString = word;


        // If the query is more than one word, we also want to search
        // the item(s) that follow the currently searched word, so build the
        // search string to accomodate forward searching
        if (queryLength > 1) {
          searchString += ` ${words.slice(index + 1, queryLength).join(' ')}`;
        }


        // Check if we have a match, either on a word or a
        // word encapsulated in parenthesis `()` (in the case
        // of an alias value)
        if (
          searchString.toLowerCase().startsWith(this.query.toLowerCase()) ||
          searchString.toLowerCase().startsWith(`(${this.query}`.toLowerCase())
        ) {
          returnCodes.push(item.code);
          return true;
        }
      }
      // Final check to see if only an alias remains, in the case that
      // above did not find a match in the items `value` property
      return item.alias?.toLowerCase().startsWith(this.query.toLowerCase()) || false;
    }) : [];


    // If we have data after filtering, set the results accordingly.
    // If the filtered data is empty, the previous state of the
    // results will persist so we never have an empty result.
    if (filteredData.length) {
      this.results = filteredData;
      return this;
    }

    // If we don't have data after filtering, check if there is a default option that should be displayed.
    if (defaultEntryOnNone) {
      const defaultIndex = this.data.findIndex(
        entry => entry.code === defaultEntryOnNone
      );

      if (defaultIndex > -1 && this.data[defaultIndex]) {
        this.results = [this.data[defaultIndex]];
      }
    }

    return this;
  }


  /**
   * Sorts suggestions by quality of matches. Quality is
   * determined by the following factors:
   *    1.) Number of words in result – The less words, the better
   *    2.) Alphabetical, `Atlanta` ranks above `Boston`
   *
   * @return {this}
   */
  sortSuggestionsByQuality(): this {
    const sortedData = this.results
      .map((result, index) => ({
        len: result.value.split(' ').length,
        val: result.value.toLowerCase(),
        pos: index,
      }))
      // First sort criteria to check is number of words in a suggestion.
      // The more words, the lower in the result it should appear
      .sort((a, b) => {
        if (a.len !== b.len) {
          return a.len - b.len;
        }


        // If the number of words is equal, we then apply an
        // alpha sort. The table below describes the return condition:
        //
        // +---------------------------------+-----------+--------------------------+
        // | Scenario                        | Condition | Value returned           |
        // +---------------------------------+-----------+--------------------------+
        // | Atlanta compared to Boston      | a < b     | -1                       |
        // | Charlotte compared to Boston    | +(a > b)  | 1 (true, cast to 1)      |
        // | Boston compared to Boston       | +(a > b)  | 0 (false, cast to 0 –    |
        // |                                 |           | indicating equal values) |
        // +---------------------------------+-----------+--------------------------+
        return a.val < b.val ? -1 : +(a.val > b.val);
      })
      .map(item => this.results[item.pos])
      .filter((result): result is DataItem => result !== undefined)

    this.results = sortedData;
    return this;
  }


  /**
  * Sort the result set prioritizing the specified code
  * so it appears at the top of the result set
  *
  * @param {String} itemCode Item code of data set to prioritize
  * @return {this}
  */
  prioritizeCode(itemCode: string): this {
    // If the provided is found and there is no alias
    // for that record, move the item to the top of the list

    // Check if input starts with any forced keyword
    const forcedMatchCode = Object.entries(forcedMappings).find(
      ([keyword]) => keyword.startsWith(itemCode.toLowerCase())
    )?.[1];

    // Use forced match code if found, else use original logic
    const codeToPrioritize = forcedMatchCode || itemCode;

    const index = this.results.findIndex(
      ({ code, alias }) =>
        code.toLowerCase() === codeToPrioritize.toLowerCase() && !alias
    );

    if (index !== -1) {
      this.results.unshift(...this.results.splice(index, 1));
    }

    return this;
  }
}
