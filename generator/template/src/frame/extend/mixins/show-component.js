export default {
  methods: {
    showComponentWithId(ref, row) {
      this.$refs[ref].show(row.id)
    },
    showComponent(ref, row) {
      this.$refs[ref].show(row)
    }
  }
}
