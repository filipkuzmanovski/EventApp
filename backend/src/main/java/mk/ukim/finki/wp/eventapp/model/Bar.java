package mk.ukim.finki.wp.eventapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="bars")
public class Bar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String name;
    // Venue address (from kadevecer JSON-LD) — used for the map in event details
    @Column(length = 512)
    private String address;
    // Reservation phone number (tel: link on the venue's kadevecer page)
    private String phone;
    // Venue type ("Бар", "Клуб", "Кафана"...) — powers "similar events"
    private String category;
    private String city;
    @Column(length = 512)
    private String kadevecerUrl;
}
