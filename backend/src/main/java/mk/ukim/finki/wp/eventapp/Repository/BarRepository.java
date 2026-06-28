package mk.ukim.finki.wp.eventapp.Repository;

import mk.ukim.finki.wp.eventapp.model.Bar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarRepository extends JpaRepository<Bar,Long> {
    Bar findByName(String name);
}
