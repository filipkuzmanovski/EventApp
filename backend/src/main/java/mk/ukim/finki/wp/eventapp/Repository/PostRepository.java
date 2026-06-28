package mk.ukim.finki.wp.eventapp.Repository;

import mk.ukim.finki.wp.eventapp.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository  extends JpaRepository<Post,Long> {
    boolean existsByPostUrl(String postUrl);

    List<Post> findAllByBar_NameContainingIgnoreCase(String barName);
}
