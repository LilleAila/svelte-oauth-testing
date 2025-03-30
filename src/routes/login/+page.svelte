<script lang="ts">
  import type { PageProps } from "./$types";

  let {data, form}: PageProps = $props();
</script>

<form action="?/login" method="post">
  {#if form?.fail}
    <div>
      {form.message}
    </div>
  {/if}

  <label>
    <span>E-Mail</span>
    <input name="email" type="email" placeholder="mail@example.com" />
  </label>
  <label>
    <span>Password</span>
    <input name="password" type="password" placeholder="password" />
  </label>
  <button type="submit">Login</button>
  <button formaction="?/register">Register</button>
</form>
