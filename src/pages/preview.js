import React, { useEffect, useState } from 'react';
import BlogPostTemplate from '../templates/blog-post';
import { withGraphql } from 'gatsby-source-graphql-universal';
import qs from 'query-string';
import { graphql } from 'gatsby';

export const query = graphql`
  query BlogTemplatePreviewQuery($slug: String!) {
    wpgraphql {
      postBy(slug: $slug) {
        revisions(last: 1, before: null) {
          nodes {
            excerpt
            content
            title
            date
          }
        }
      }
    }
  }
`;

function Preview({ graphql, location }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { slug, wpnonce } = qs.parse(location.search);
      const context = {
        headers: {
          'X-WP-Nonce': wpnonce,
        },
        credentials: 'include',
      };
      try {
        const { data } = await graphql('wpgraphql', {
          query,
          context,
          variables: { slug },
        });
        setPost(data.postBy.revisions.nodes[0]);
        setLoading(false);
      } catch (error) {
        setError(error);
        throw Error(error);
      }
    };
    fetchPost();
  }, []);

  if (error !== null) {
    return <span>{error}</span>;
  }
  if (loading) {
    return <span>Loading...</span>;
  }
  return <BlogPostTemplate preview={post} location={'/preview'} />;
}

export default withGraphql(Preview);
