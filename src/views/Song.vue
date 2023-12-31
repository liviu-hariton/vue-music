<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
          @click.prevent="newSong(song)"
        >
          <i class="fas" :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
          <div class="song-price">{{ $n(1, 'currency') }}</div>
        </div>
      </div>
    </section>

    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div
          class="px-6 pt-6 pb-5 font-bold border-b border-gray-200"
          v-icon-secondary="{ icon: 'comments', right: true }"
        >
          <!-- Comment Count -->
          <span class="card-title">
            {{ $tc('song.comment_count', song.comment_count, { count: song.comment_count }) }}
          </span>
        </div>

        <div class="p-6">
          <div
            class="text-white text-center font-bold p-4 rounded mb-4"
            v-if="comment_show_alert"
            :class="comment_alert_variant"
          >
            {{ comment_alert_msg }}
          </div>

          <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
            <vee-field
              name="comment"
              as="textarea"
              rows="3"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."
            />
            <ErrorMessage class="text-red-600" name="comment" />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission"
            >
              Submit
            </button>
          </vee-form>

          <!-- Sort Comments -->
          <select
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            v-model="sort"
          >
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Comments -->
    <ul class="container mx-auto">
      <li
        class="p-6 bg-gray-50 border border-gray-200"
        v-for="comment in sortedComments"
        :key="comment.docId"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.name }}</div>
          <time>{{ comment.datePosted }}</time>
        </div>

        <p>
          {{ comment.content }}
        </p>
      </li>
    </ul>
  </main>
</template>

<script>
import { songsCollection, auth, commentsCollection } from '@/includes/firebase'
import { mapState, mapActions } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'

import IconSecondary from '@/directives/icon-secondary'

export default {
  name: 'Song',
  directives: {
    'icon-secondary': IconSecondary
  },
  data() {
    return {
      song: {},
      schema: {
        comment: 'required|min:3'
      },
      comment_in_submission: false,
      comment: '',
      comment_show_alert: false,
      comment_alert_msg: 'Please wait... Adding comment...',
      comment_alert_variant: 'bg-blue-500',
      comments: [],
      sort: '1' // 1 = latest->oldest, 2 = oldest->latest
    }
  },
  computed: {
    ...mapState(useUserStore, ['userLoggedIn']),
    ...mapState(usePlayerStore, ['playing']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === '1') {
          return new Date(b.datePosted) - new Date(a.datePosted)
        }

        return new Date(a.datePosted) - new Date(b.datePosted)
      })
    }
  },
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await songsCollection.doc(to.params.id).get()

    next((vm) => {
      if (!docSnapshot.exists) {
        vm.$router.push({ name: 'not-found' })

        return
      }

      const { sort } = vm.$route.query

      vm.sort = sort === '1' || sort === '2' ? sort : '1'

      vm.song = docSnapshot.data()

      vm.getComments()
    })
  },
  methods: {
    ...mapActions(usePlayerStore, ['newSong']),
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true
      this.comment_show_alert = true
      this.comment_alert_variant = 'bg-blue-500'
      this.comment_alert_msg = 'Please wait... Adding comment...'

      // Add comment to comments collection
      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid
      }

      try {
        await commentsCollection.add(comment)
      } catch (error) {
        this.comment_in_submission = false
        this.comment_alert_variant = 'bg-red-500'
        this.comment_alert_msg = 'Error! Unable to add comment.'

        return
      }

      // Update comment count in songs collection
      this.song.comment_count += 1

      await songsCollection.doc(this.$route.params.id).update({
        comment_count: this.song.comment_count
      })

      // Update comments
      await this.getComments()

      this.comment_in_submission = false
      this.comment_alert_variant = 'bg-green-500'
      this.comment_alert_msg = 'Comment added successfully.'
      this.comment_show_alert = true

      resetForm()
    },
    async getComments() {
      const snapshots = await commentsCollection.where('sid', '==', this.$route.params.id).get()

      this.comments = []

      snapshots.forEach((doc) => {
        this.comments.push({
          docId: doc.id,
          ...doc.data()
        })
      })
    }
  },
  watch: {
    sort(newVal) {
      // Prevents the router from pushing the same query value
      if (newVal === this.$route.query.sort) {
        return
      }

      this.$router.push({
        query: {
          sort: newVal
        }
      })

      this.getComments()
    }
  }
}
</script>
